<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reminder: Invitation to {{ $organization->name }}</title>
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
            background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
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
        .urgency-indicator {
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            padding: 8px 16px;
            display: inline-block;
            margin-top: 16px;
            font-size: 14px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .reminder-notice {
            background-color: #fed7d7;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
            border-left: 4px solid #f56565;
            text-align: center;
        }
        .reminder-notice h3 {
            color: #c53030;
            margin: 0 0 12px 0;
            font-size: 18px;
        }
        .expiry-countdown {
            font-size: 32px;
            font-weight: bold;
            color: #c53030;
            margin: 8px 0;
        }
        .organization-info {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
            border-left: 4px solid #f6ad55;
        }
        .organization-name {
            font-size: 20px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 8px;
        }
        .role-badge {
            display: inline-block;
            background-color: #f6ad55;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            margin-top: 8px;
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
        .btn-secondary {
            background-color: #e2e8f0;
            color: #4a5568;
        }
        .btn-secondary:hover {
            background-color: #cbd5e0;
        }
        .timeline {
            background-color: #f7fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
            border-left: 4px solid #4299e1;
        }
        .timeline-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .timeline-label {
            font-weight: 600;
            color: #2d3748;
        }
        .timeline-value {
            color: #4a5568;
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
            color: #f6ad55;
            text-decoration: none;
        }
        .what-happens-next {
            background-color: #e6fffa;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
            border-left: 4px solid #38b2ac;
        }
        .what-happens-next h4 {
            color: #234e52;
            margin: 0 0 12px 0;
        }
        .what-happens-next ul {
            margin: 0;
            padding-left: 20px;
        }
        .what-happens-next li {
            color: #285e61;
            margin-bottom: 8px;
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
            .expiry-countdown {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>⏰ Invitation Reminder</h1>
            <p>Your invitation to {{ $organization->name }} is expiring soon</p>
            <div class="urgency-indicator">
                @if($daysUntilExpiry <= 1)
                    ⚠️ Expires {{ $daysUntilExpiry == 0 ? 'today' : 'tomorrow' }}
                @else
                    {{ $daysUntilExpiry }} days remaining
                @endif
            </div>
        </div>

        <!-- Content -->
        <div class="content">
            <p>Hello!</p>
            
            <p>
                This is a friendly reminder that your invitation to join 
                <strong>{{ $organization->name }}</strong> on PortzApp is expiring soon.
            </p>

            <!-- Reminder Notice -->
            <div class="reminder-notice">
                <h3>⚠️ Time is Running Out!</h3>
                <div class="expiry-countdown">
                    @if($daysUntilExpiry == 0)
                        Expires Today
                    @elseif($daysUntilExpiry == 1)
                        1 Day Left
                    @else
                        {{ $daysUntilExpiry }} Days Left
                    @endif
                </div>
                <p>Your invitation expires on {{ $expiresAt->format('F j, Y \a\t g:i A') }}</p>
            </div>

            <!-- Organization Information -->
            <div class="organization-info">
                <div class="organization-name">{{ $organization->name }}</div>
                <p>{{ ucfirst(str_replace('_', ' ', $organization->business_type)) }}</p>
                <div class="role-badge">{{ $roleName }}</div>
            </div>

            <!-- Timeline -->
            <div class="timeline">
                <div class="timeline-item">
                    <span class="timeline-label">Originally Invited:</span>
                    <span class="timeline-value">{{ $invitation->created_at->format('F j, Y') }}</span>
                </div>
                <div class="timeline-item">
                    <span class="timeline-label">Invited By:</span>
                    <span class="timeline-value">
                        @if($invitedBy)
                            {{ $invitedBy->first_name }} {{ $invitedBy->last_name }}
                        @else
                            PortzApp Team
                        @endif
                    </span>
                </div>
                <div class="timeline-item">
                    <span class="timeline-label">Your Role:</span>
                    <span class="timeline-value">{{ $roleName }}</span>
                </div>
                <div class="timeline-item">
                    <span class="timeline-label">Expires:</span>
                    <span class="timeline-value">{{ $expiresAt->format('F j, Y \a\t g:i A') }}</span>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="actions">
                <a href="{{ $acceptUrl }}" class="btn btn-primary">✅ Accept Invitation Now</a>
                <a href="{{ $declineUrl }}" class="btn btn-secondary">❌ Decline</a>
            </div>

            <!-- What Happens Next -->
            <div class="what-happens-next">
                <h4>🚀 What happens when you accept?</h4>
                <ul>
                    <li>Instant access to {{ $organization->name }}'s PortzApp workspace</li>
                    <li>Collaborate on shipping operations and vessel management</li>
                    <li>Access to port services and booking systems</li>
                    <li>Real-time updates and notifications</li>
                    <li>Professional networking with industry peers</li>
                </ul>
            </div>

            @if($daysUntilExpiry <= 2)
            <p style="background-color: #fff5f5; padding: 16px; border-radius: 6px; border-left: 4px solid #f56565;">
                <strong style="color: #c53030;">⚠️ Urgent Action Required:</strong>
                This invitation will expire in 
                @if($daysUntilExpiry == 0)
                    less than 24 hours
                @elseif($daysUntilExpiry == 1)
                    1 day
                @else
                    {{ $daysUntilExpiry }} days
                @endif
                . After that, you'll need to request a new invitation to join {{ $organization->name }}.
            </p>
            @endif

            <p>
                If you have any questions about this invitation or need assistance, 
                @if($invitedBy)
                    you can reply to this email to contact {{ $invitedBy->first_name }} {{ $invitedBy->last_name }} directly.
                @else
                    please contact our support team.
                @endif
            </p>

            <p>
                Don't miss this opportunity to join {{ $organization->name }} and streamline your shipping operations with PortzApp!
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>
                This reminder was sent by PortzApp on behalf of {{ $organization->name }}.<br>
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