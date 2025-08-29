<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation to {{ $organization->name }}</title>
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
            margin: 8px 8px 8px 0;
            text-decoration: none;
            border: 1px solid #000;
            font-weight: 600;
            text-align: center;
        }
        .btn-primary {
            background-color: #000;
            color: #fff;
        }
        .btn-secondary {
            background-color: #fff;
            color: #000;
        }
        .info-section {
            margin: 20px 0;
            padding: 16px;
            border: 1px solid #e5e5e5;
            background-color: #f8f8f8;
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
                margin: 8px 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Organization Invitation</h1>
        </div>

        <div class="content">
            <p>Hello,</p>
            
            <p>
                @if($invitedBy)
                    <strong>{{ $invitedBy->first_name }} {{ $invitedBy->last_name }}</strong> 
                    ({{ $invitedBy->email }}) has invited you to join their organization on PortzApp.
                @else
                    You have been invited to join an organization on PortzApp.
                @endif
            </p>

            <div class="info-section">
                <p><strong>Organization:</strong> {{ $organization->name }}</p>
                <p><strong>Type:</strong> {{ $organization->business_type->label() }}</p>
                <p><strong>Your Role:</strong> {{ $roleName }}</p>
                <p><strong>Expires:</strong> {{ $expiresAt->format('F j, Y \a\t g:i A') }}</p>
            </div>

            @if($customMessage)
            <div class="info-section">
                <p><strong>Message:</strong></p>
                <p>{{ $customMessage }}</p>
            </div>
            @endif

            <a href="{{ $acceptUrl }}" class="btn btn-primary">Accept Invitation</a>
            <a href="{{ $declineUrl }}" class="btn btn-secondary">Decline</a>

            <p style="margin-top: 24px; font-size: 14px; color: #666;">
                This invitation link is unique to you and expires on {{ $expiresAt->format('F j, Y') }}. 
                If you didn't expect this invitation, ignore this email.
            </p>
        </div>

        <div class="footer">
            <p>
                <a href="{{ config('app.url') }}">PortzApp</a> | 
                <a href="{{ config('app.url') }}/privacy">Privacy</a> | 
                <a href="{{ config('app.url') }}/terms">Terms</a>
            </p>
            <p style="margin-top: 12px; font-size: 12px; word-break: break-all;">
                {{ $acceptUrl }}
            </p>
        </div>
    </div>
</body>
</html>