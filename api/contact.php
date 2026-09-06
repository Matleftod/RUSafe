<?php
declare(strict_types=1);

/**
 * R’U SAFE contact endpoint. Deploy this file with the static build on IONOS.
 * SMTP credentials are intentionally read from a PHP file outside the public web root.
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $status, bool $ok, string $message): never {
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'Method not allowed.');
}

$configPath = getenv('RUSAFE_SMTP_CONFIG') ?: '';
if ($configPath === '' || !is_file($configPath)) {
    error_log('R’U SAFE contact form: SMTP configuration is unavailable.');
    respond(503, false, 'Service temporarily unavailable.');
}

/** @var array{host:string,port:int,username:string,password:string,from_email:string,from_name:string,to_email:string,allowed_origins?:list<string>} $config */
$config = require $configPath;
foreach (['host', 'port', 'username', 'password', 'from_email', 'from_name', 'to_email'] as $required) {
    if (!isset($config[$required]) || $config[$required] === '') respond(503, false, 'Service temporarily unavailable.');
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && isset($config['allowed_origins']) && !in_array($origin, $config['allowed_origins'], true)) {
    respond(403, false, 'Origin not allowed.');
}

function input(string $key, int $maximum): string {
    $value = trim((string)($_POST[$key] ?? ''));
    return mb_substr(preg_replace('/\s+/u', ' ', $value) ?? '', 0, $maximum, 'UTF-8');
}

// Bots completing this visually hidden field receive no delivery confirmation.
if (input('company', 200) !== '') respond(204, true, '');

$name = input('name', 120);
$organisation = input('organisation', 160);
$role = input('role', 120);
$email = input('email', 254);
$need = input('need', 120);
$deadline = input('deadline', 120);
$message = trim(mb_substr((string)($_POST['message'] ?? ''), 0, 5000, 'UTF-8'));

if ($name === '' || $organisation === '' || $need === '' || mb_strlen($message, 'UTF-8') < 20 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, false, 'Please check the required fields.');
}

foreach ([$name, $organisation, $role, $email, $need, $deadline] as $value) {
    if (preg_match('/[\r\n]/', $value)) respond(422, false, 'Invalid input.');
}

function enforceRateLimit(): void {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $key = hash('sha256', $ip . '|' . date('Y-m-d-H'));
    $path = sys_get_temp_dir() . DIRECTORY_SEPARATOR . "rusafe-contact-$key";
    $handle = @fopen($path, 'c+');
    if ($handle === false) return; // Do not block legitimate requests if the host temp folder is unavailable.
    flock($handle, LOCK_EX);
    $count = (int)stream_get_contents($handle);
    if ($count >= 5) {
        flock($handle, LOCK_UN);
        fclose($handle);
        respond(429, false, 'Too many requests. Please try again later.');
    }
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, (string)($count + 1));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
}

enforceRateLimit();

function smtpRead($socket, array $accepted): void {
    $response = '';
    do {
        $line = fgets($socket, 515);
        if ($line === false) throw new RuntimeException('SMTP connection closed unexpectedly.');
        $response .= $line;
    } while (isset($line[3]) && $line[3] === '-');

    $code = (int)substr($response, 0, 3);
    if (!in_array($code, $accepted, true)) throw new RuntimeException("SMTP error $code");
}

function smtpWrite($socket, string $command, array $accepted): void {
    fwrite($socket, $command . "\r\n");
    smtpRead($socket, $accepted);
}

function base64Header(string $value): string {
    return '=?UTF-8?B?' . base64_encode($value) . '?=';
}

try {
    $context = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]);
    $socket = stream_socket_client(
        'tls://' . $config['host'] . ':' . (int)$config['port'],
        $errorNumber,
        $errorMessage,
        15,
        STREAM_CLIENT_CONNECT,
        $context
    );
    if ($socket === false) throw new RuntimeException("SMTP connection failed: $errorNumber $errorMessage");
    stream_set_timeout($socket, 15);

    smtpRead($socket, [220]);
    smtpWrite($socket, 'EHLO ' . (gethostname() ?: 'localhost'), [250]);
    smtpWrite($socket, 'AUTH LOGIN', [334]);
    smtpWrite($socket, base64_encode($config['username']), [334]);
    smtpWrite($socket, base64_encode($config['password']), [235]);
    smtpWrite($socket, 'MAIL FROM:<' . $config['from_email'] . '>', [250]);
    smtpWrite($socket, 'RCPT TO:<' . $config['to_email'] . '>', [250, 251]);
    smtpWrite($socket, 'DATA', [354]);

    $subject = 'R’U SAFE — ' . $need;
    $body = "Nom : $name\nOrganisation : $organisation\nFonction : $role\nE-mail : $email\nBesoin : $need\nÉchéance : $deadline\n\nMessage :\n$message\n";
    $headers = [
        'From: ' . base64Header($config['from_name']) . ' <' . $config['from_email'] . '>',
        'Reply-To: ' . $email,
        'To: ' . $config['to_email'],
        'Subject: ' . base64Header($subject),
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64'
    ];
    $payload = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode(str_replace("\n", "\r\n", $body)), 76, "\r\n") . ".\r\n";
    fwrite($socket, $payload);
    smtpRead($socket, [250]);
    smtpWrite($socket, 'QUIT', [221]);
    fclose($socket);
} catch (Throwable $exception) {
    error_log('R’U SAFE contact form: ' . $exception->getMessage());
    respond(502, false, 'Unable to deliver the message.');
}

respond(200, true, 'Message sent.');
