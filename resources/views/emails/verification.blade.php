<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your PortzApp Email Address</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .verification-info {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
            border-left: 4px solid #667eea;
        }
        .actions {
            text-align: center;
            margin: 32px 0;
        }
        .btn {
            display: inline-block;
            padding: 14px 36px;
            margin: 8px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 18px;
            transition: all 0.2s ease;
        }
        .btn-primary {
            background-color: #48bb78;
            color: white;
            box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
        }
        .btn-primary:hover {
            background-color: #38a169;
            transform: translateY(-1px);
        }
        .security-notice {
            background-color: #e6fffa;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
            border-left: 4px solid #38b2ac;
            font-size: 14px;
        }
        .security-notice strong {
            color: #234e52;
        }
        .footer {
            background-color: #f7fafc;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #718096;
            border-top: 1px solid #e2e8f0;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .btn {
                display: block;
                margin: 8px 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>✉️ Verify Your Email</h1>
            <p>Complete your PortzApp account setup</p>
        </div>

        <!-- Content -->
        <div class="content">
            <p>Hello {{ $user->first_name }}!</p>
            
            <p>
                Welcome to PortzApp! To complete your account setup and start accessing your organization's shipping operations, please verify your email address.
            </p>

            <!-- Verification Information -->
            <div class="verification-info">
                <p style="margin-bottom: 12px;"><strong>Email to verify:</strong> {{ $user->email }}</p>
                <p style="margin: 0; font-size: 14px; color: #4a5568;">
                    Click the button below to confirm this is your email address and activate your account.
                </p>
            </div>

            <!-- Action Button -->
            <div class="actions">
                <a href="{{ $verificationUrl }}" class="btn btn-primary">✅ Verify Email Address</a>
            </div>

            <!-- Security Notice -->
            <div class="security-notice">
                <strong>Security Notice:</strong> This verification link is unique to your account and will expire after 24 hours. 
                If you didn't create a PortzApp account, please ignore this email.
            </div>

            <p>
                Once your email is verified, you'll have full access to PortzApp's platform for managing shipping operations, vessels, and port services.
            </p>

            <p>
                If you have any questions or need assistance, please don't hesitate to contact our support team.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>
                This email was sent by PortzApp to verify your account.<br>
                <a href="{{ config('app.url') }}">Visit PortzApp</a> | 
                <a href="{{ config('app.url') }}/privacy">Privacy Policy</a> | 
                <a href="{{ config('app.url') }}/terms">Terms of Service</a>
            </p>
            <p style="margin-top: 16px; font-size: 12px;">
                If you're having trouble with the button above, copy and paste this URL into your browser:<br>
                <span style="word-break: break-all;">{{ $verificationUrl }}</span>
            </p>
        </div>
    </div>
</body>
</html>