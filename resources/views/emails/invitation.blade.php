<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation to {{ $organization->name }}</title>
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
        .organization-info {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
            border-left: 4px solid #667eea;
        }
        .organization-name {
            font-size: 20px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 8px;
        }
        .role-badge {
            display: inline-block;
            background-color: #667eea;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            margin-top: 8px;
        }
        .custom-message {
            background-color: #f7fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
            border-left: 4px solid #4299e1;
        }
        .custom-message-header {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 8px;
        }
        .actions {
            text-align: center;
            margin: 32px 0;
        }
        .btn {
            display: inline-block;
            padding: 12px 32px;
            margin: 8px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.2s ease;
        }
        .btn-primary {
            background-color: #48bb78;
            color: white;
        }
        .btn-primary:hover {
            background-color: #38a169;
        }
        .btn-secondary {
            background-color: #e2e8f0;
            color: #4a5568;
        }
        .btn-secondary:hover {
            background-color: #cbd5e0;
        }
        .invitation-details {
            background-color: #fffaf0;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
            border: 1px solid #fbd38d;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .detail-label {
            font-weight: 600;
            color: #744210;
        }
        .detail-value {
            color: #975a16;
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
        .security-notice {
            background-color: #fed7d7;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
            border-left: 4px solid #f56565;
            font-size: 14px;
        }
        .security-notice strong {
            color: #c53030;
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
            <h1>You're Invited!</h1>
            <p>Join {{ $organization->name }} on PortzApp</p>
        </div>

        <!-- Content -->
        <div class="content">
            <p>Hello!</p>
            
            <p>
                @if($invitedBy)
                    <strong>{{ $invitedBy->first_name }} {{ $invitedBy->last_name }}</strong> 
                    ({{ $invitedBy->email }}) has invited you to join their organization on PortzApp.
                @else
                    You have been invited to join an organization on PortzApp.
                @endif
            </p>

            <!-- Organization Information -->
            <div class="organization-info">
                <div class="organization-name">{{ $organization->name }}</div>
                <p>{{ $organization->business_type->label() }}</p>
                <div class="role-badge">{{ $roleName }}</div>
            </div>

            <!-- Custom Message -->
            @if($customMessage)
            <div class="custom-message">
                <div class="custom-message-header">Personal Message:</div>
                <p>{{ $customMessage }}</p>
            </div>
            @endif

            <!-- Invitation Details -->
            <div class="invitation-details">
                <div class="detail-row">
                    <span class="detail-label">Your Role:</span>
                    <span class="detail-value">{{ $roleName }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Organization Type:</span>
                    <span class="detail-value">{{ $organization->business_type->label() }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Invitation Expires:</span>
                    <span class="detail-value">{{ $expiresAt->format('F j, Y \a\t g:i A') }}</span>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="actions">
                <a href="{{ $acceptUrl }}" class="btn btn-primary">Create Account & Join</a>
                <a href="{{ $declineUrl }}" class="btn btn-secondary">No Thanks</a>
            </div>

            <!-- Security Notice -->
            <div class="security-notice">
                <strong>Security Notice:</strong> This invitation link is unique to you and will expire on 
                {{ $expiresAt->format('F j, Y') }}. If you didn't expect this invitation or don't recognize 
                the sender, please ignore this email.
            </div>

            <p>
                By creating your account, you'll join {{ $organization->name }} and gain access to PortzApp's 
                platform to collaborate on managing shipping operations, vessels, and port services.
            </p>

            <p>
                If you have any questions about this invitation, you can reply to this email to contact 
                @if($invitedBy)
                    {{ $invitedBy->first_name }} {{ $invitedBy->last_name }}
                @else
                    the person who invited you
                @endif
                directly.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>
                This invitation was sent by PortzApp on behalf of {{ $organization->name }}.<br>
                <a href="{{ config('app.url') }}">Visit PortzApp</a> | 
                <a href="{{ config('app.url') }}/privacy">Privacy Policy</a> | 
                <a href="{{ config('app.url') }}/terms">Terms of Service</a>
            </p>
            <p style="margin-top: 16px; font-size: 12px;">
                If you're having trouble with the buttons above, copy and paste this URL into your browser:<br>
                <span style="word-break: break-all;">{{ $acceptUrl }}</span>
            </p>
        </div>
    </div>
</body>
</html>