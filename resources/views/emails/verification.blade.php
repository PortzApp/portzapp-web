<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your PortzApp Email Address</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.5;
            color: #000;
            background-color: #fff;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            border: 1px solid #e5e5e5;
        }
        .header {
            background-color: #fff;
            padding: 20px;
            border-bottom: 1px solid #e5e5e5;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #000;
        }
        .content {
            padding: 20px;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 16px 0;
            text-decoration: none;
            border: 1px solid #000;
            font-weight: 600;
            text-align: center;
        }
        .btn-primary {
            background-color: #000;
            color: #fff;
        }
        .footer {
            background-color: #f8f8f8;
            padding: 20px;
            border-top: 1px solid #e5e5e5;
            font-size: 14px;
            color: #666;
        }
        .footer a {
            color: #000;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .container {
                border: none;
            }
            .header, .content, .footer {
                padding: 16px;
            }
            .btn {
                display: block;
                width: 100%;
                box-sizing: border-box;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Email Verification</h1>
        </div>

        <div class="content">
            <p>Hello {{ $user->first_name }},</p>
            
            <p>Please verify your email address to activate your PortzApp account.</p>

            <p><strong>Email:</strong> {{ $user->email }}</p>

            <a href="{{ $verificationUrl }}" class="btn btn-primary">Verify Email Address</a>

            <p style="margin-top: 24px; font-size: 14px; color: #666;">
                This link expires in 24 hours. If you didn't create an account, ignore this email.
            </p>
        </div>

        <div class="footer">
            <p>
                <a href="{{ config('app.url') }}">PortzApp</a> | 
                <a href="{{ config('app.url') }}/privacy">Privacy</a> | 
                <a href="{{ config('app.url') }}/terms">Terms</a>
            </p>
            <p style="margin-top: 12px; font-size: 12px; word-break: break-all;">
                {{ $verificationUrl }}
            </p>
        </div>
    </div>
</body>
</html>