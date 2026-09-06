<?php
declare(strict_types=1);

// Copy this file OUTSIDE the public web root on IONOS, fill it in there, then set
// the RUSAFE_SMTP_CONFIG PHP environment variable to its absolute path.
// Never commit the populated file and never place it in dist/.
return [
    'host' => '[smtp-host-to-be-confirmed-with-ionos]',
    'port' => 465,
    'username' => '[smtp-username-to-be-provided]',
    'password' => '[smtp-password-to-be-provided]',
    'from_email' => '[sender-address-on-the-client-domain]',
    'from_name' => 'R’U SAFE',
    'to_email' => 'contact@rusafe.fr',
    'allowed_origins' => ['https://rusafe.fr', 'https://www.rusafe.fr']
];
