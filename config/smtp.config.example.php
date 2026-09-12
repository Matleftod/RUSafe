<?php
declare(strict_types=1);

// Copy this file outside the public web root as private-config/rusafe-smtp.php and
// fill it in there. Never commit the populated file and never place it in dist/.
return [
    'host' => 'smtp.ionos.fr',
    'port' => 465,
    'username' => '[full-IONOS-mailbox-address]',
    'password' => '[SMTP-password]',
    'from_email' => '[same-IONOS-mailbox-address]',
    'from_name' => 'R’U SAFE',
    'to_email' => 'contact@rusafe.fr',
    'allowed_origins' => ['https://rusafe.fr', 'https://www.rusafe.fr']
];
