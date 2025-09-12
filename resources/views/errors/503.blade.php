<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }

            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.5;
                }
            }

            .animate-pulse {
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
        </style>

        <title>Maintenance - {{ config('app.name', 'PortzApp') }}</title>

        <link rel="icon" href="/portzapp-transparent-favicon.ico" sizes="any">
        <link rel="icon" href="/portzapp-transparent-favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/portzapp-transparent-apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                darkMode: 'class',
                theme: {
                    extend: {
                        fontFamily: {
                            sans: ['Instrument Sans', 'ui-sans-serif', 'system-ui', 'sans-serif']
                        },
                        colors: {
                            'portzapp-blue': '#2558A6',
                            'portzapp-gold': '#D6A165'
                        }
                    }
                }
            }
        </script>
    </head>
    <body class="font-sans antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <div class="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8 text-center">
                {{-- PortzApp Logo --}}
                <div class="flex justify-center">
                    <div class="w-80 h-20 flex items-center justify-center">
                        <svg width="300" height="89" viewBox="0 0 630 148" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
                            <path d="M177.505 68.9117C177.505 100.291 134.413 89.7161 134.413 114.049V122.578H119.521V42.9885H151.355C168.98 42.9885 177.505 52.3102 177.505 68.9117ZM162.041 68.9117C162.041 57.77 155.106 57.2031 150.218 57.2031H134.413V90.743C144.762 81.0763 162.041 81.7583 162.041 68.9117Z" fill="#D6A165"/>
                            <path d="M249.247 91.877C249.247 109.727 235.378 124.279 216.73 124.279C198.198 124.279 184.324 109.727 184.324 91.877C184.324 73.9115 198.198 59.36 216.73 59.36C235.374 59.36 249.247 73.9115 249.247 91.877ZM234.466 91.877C234.466 81.9843 228.328 72.7775 216.73 72.7775C205.248 72.7775 199.106 81.9843 199.106 91.877C199.106 101.655 205.248 110.865 216.73 110.865C228.328 110.865 234.466 101.655 234.466 91.877Z" fill="#D6A165"/>
                            <path d="M301.09 61.1799V74.7085H283.695C275.963 74.7085 273.577 77.8924 273.577 84.8272V122.574H259.251V80.2793C259.251 68.9077 266.983 61.1799 278.354 61.1799H301.09Z" fill="#D6A165"/>
                            <path d="M337.928 109.612V122.574H325.423C317.691 122.574 309.277 118.938 309.277 107.681V49.4673H323.603V61.18H336.108V73.5706H323.603V103.019C323.603 107.34 326.331 109.612 330.197 109.612H337.928Z" fill="#D6A165"/>
                            <path d="M397.047 109.045V122.574H344.975V112.796L375.331 74.7085H346.113V61.1799H396.48V70.8426L366.124 109.045H397.047Z" fill="#D6A165"/>
                            <path d="M480.613 122.574H464.583L459.464 109.953H449.345C434.679 109.953 422.173 111.432 417.737 122.574H401.706L433.997 42.9885H448.323L480.613 122.574ZM453.897 96.3098L441.162 64.7009L425.813 102.674C432.522 97.7848 440.365 96.3059 449.349 96.3059H453.897V96.3098Z" fill="#2558A6"/>
                            <path d="M524.497 124.279C514.264 124.279 506.532 118.593 502.555 111.432V147.815H488.229V61.0649H502.555V72.2066C506.536 65.0418 514.268 59.36 524.497 59.36C563.156 59.36 563.156 124.279 524.497 124.279ZM520.861 72.3216C508.356 72.3216 502.555 82.3253 502.555 91.877C502.555 101.314 508.352 111.317 520.861 111.317C544.283 111.317 544.283 72.3216 520.861 72.3216Z" fill="#2558A6"/>
                            <path d="M600.904 124.279C590.67 124.279 582.938 118.593 578.961 111.432V147.815H564.636V61.0649H578.961V72.2066C582.942 65.0418 590.674 59.36 600.904 59.36C639.558 59.36 639.558 124.279 600.904 124.279ZM597.264 72.3216C584.758 72.3216 578.957 82.3253 578.957 91.877C578.957 101.314 584.754 111.317 597.264 111.317C620.685 111.317 620.685 72.3216 597.264 72.3216Z" fill="#2558A6"/>
                            <path d="M53.6545 0H50.9385V30.5662H53.6545V0Z" fill="#D6A165"/>
                            <path d="M72.3142 15.2811H52.2949V0H72.3142L66.8821 7.47006L72.3142 15.2811Z" fill="#D6A165"/>
                            <path d="M39.5306 30.5662H22.5684V47.5284H39.5306V30.5662Z" fill="#D6A165"/>
                            <path d="M60.4857 30.5662H43.5234V47.5284H60.4857V30.5662Z" fill="#D6A165"/>
                            <path d="M81.4408 30.5662H64.4785V47.5284H81.4408V30.5662Z" fill="#D6A165"/>
                            <path d="M57.9961 64.3916C57.0008 63.781 56.1682 63.1783 55.4228 62.5994C55.2681 62.4805 55.0897 62.3536 54.943 62.2347C54.7884 62.1078 54.6615 61.9888 54.5148 61.8659C53.9716 61.402 53.4918 60.9579 53.1112 60.5773C52.1199 59.5741 51.6679 58.9041 51.6679 58.9041C51.6679 58.9041 51.3071 59.4354 50.53 60.2601C50.3991 60.3989 50.2603 60.5456 50.1057 60.6962C49.8004 61.0015 49.4435 61.3386 49.0391 61.6914C48.8369 61.8699 48.6228 62.0523 48.3928 62.2347C47.8536 62.6748 47.2152 63.1387 46.5293 63.6065C46.216 63.8206 45.8988 64.0348 45.5578 64.2489C45.4825 64.2965 45.4151 64.344 45.3358 64.3916C38.0799 68.8364 23.9843 73.182 0 65.3432L0.325133 66.3265L17.668 98.0901C28.0484 91.7263 39.8165 88.4948 51.6084 88.4433C63.3131 88.3917 75.0178 91.4686 85.3783 97.6223L102.951 65.4582C79.2048 73.1265 65.2124 68.8126 57.9961 64.3916Z" fill="#D6A165"/>
                            <path d="M57.1233 133.196C55.7355 131.797 53.8442 131.016 51.8736 131.035C51.8736 131.035 51.8736 131.035 51.8736 131.031C49.9744 131.031 48.1624 131.809 46.8143 133.145C43.9555 135.98 43.9317 140.595 46.7667 143.458C49.6017 146.32 54.217 146.34 57.0757 143.509C59.9385 140.674 59.9583 136.055 57.1233 133.196Z" fill="#2558A6"/>
                            <path d="M21.8154 105.683L26.8787 114.957C41.3986 103.804 61.513 103.657 76.1795 114.458L81.2309 105.215C72.3652 99.0774 61.9928 96.0204 51.6203 96.064C41.1527 96.1076 30.697 99.3193 21.8154 105.683Z" fill="#2558A6"/>
                            <path d="M51.4381 114.386C44.0553 114.477 36.7042 117.007 30.7012 121.959L35.8517 131.392C44.5787 122.784 58.3174 122.602 67.2624 130.789L72.3813 121.424C66.7272 117.003 59.951 114.66 53.1074 114.406C52.5483 114.37 51.9932 114.37 51.4381 114.386Z" fill="#2558A6"/>
                            <path d="M29.139 64.2488V50.3475H12.1768V63.7017C18.7626 64.8198 24.381 64.8515 29.139 64.2488Z" fill="#D6A165"/>
                            <path d="M45.5582 58.5591C45.8952 58.345 46.2163 58.1309 46.5256 57.9128C47.2116 57.4449 47.8499 56.981 48.3892 56.5409C48.6191 56.3546 48.8333 56.1722 49.0355 55.9977C49.4121 55.6686 49.7333 55.3633 50.0228 55.0739V50.3436H33.0645V63.559C38.3815 62.3972 42.4218 60.4821 45.3361 58.6979C45.4154 58.6543 45.4828 58.6067 45.5582 58.5591Z" fill="#D6A165"/>
                            <path d="M54.943 56.5409C55.0897 56.6599 55.2681 56.7828 55.4227 56.9057C56.1682 57.4846 57.0048 58.0912 57.996 58.6979C61.0332 60.5575 65.2837 62.5638 70.9418 63.7017V50.3397H53.9795V55.6964C54.154 55.851 54.3244 56.0096 54.5148 56.1722C54.6615 56.2991 54.7883 56.414 54.943 56.5409Z" fill="#D6A165"/>
                            <path d="M91.8333 63.559V50.3436H74.875V64.3163C79.6449 64.8516 85.2712 64.7405 91.8333 63.559Z" fill="#D6A165"/>
                        </svg>
                    </div>
                </div>

                {{-- Maintenance Status Indicator --}}
                <div class="flex justify-center">
                    <div class="flex items-center space-x-2 bg-portzapp-gold/20 dark:bg-portzapp-gold/10 text-portzapp-blue dark:text-portzapp-gold px-4 py-2 rounded-full border border-portzapp-gold/30">
                        <div class="w-2 h-2 bg-portzapp-gold rounded-full animate-pulse"></div>
                        <span class="text-sm font-medium">Under Maintenance</span>
                    </div>
                </div>

                {{-- Main Content --}}
                <div class="space-y-6">
                    <div class="space-y-2">
                        <h1 class="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
                            We'll be back soon!
                        </h1>
                        <p class="text-gray-600 dark:text-gray-400 text-base sm:text-lg leading-relaxed">
                            PortzApp is currently undergoing scheduled maintenance to improve your experience. 
                            We're working hard to get everything back online as quickly as possible.
                        </p>
                    </div>

                    {{-- Contact Information --}}
                    <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border border-portzapp-blue/20 dark:border-portzapp-gold/20">
                        <div class="space-y-2">
                            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                                Need assistance?
                            </h2>
                            <p class="text-gray-600 dark:text-gray-400 text-sm">
                                For any urgent inquiries or updates, please contact us:
                            </p>
                            <div class="flex items-center justify-center space-x-2 mt-3">
                                <svg class="w-5 h-5 text-portzapp-blue dark:text-portzapp-gold" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                </svg>
                                <a href="mailto:info@portzapp.com" 
                                   class="text-portzapp-blue dark:text-portzapp-gold hover:text-portzapp-blue/80 dark:hover:text-portzapp-gold/80 font-medium transition-colors duration-200">
                                    info@portzapp.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {{-- Status Message --}}
                    <div class="text-center">
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Thank you for your patience while we enhance PortzApp.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>