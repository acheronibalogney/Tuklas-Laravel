<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendOtpEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(
        public string $email,
        public string $code,
    ) {
    }

    public function handle(): void
    {
        $from = trim((string) config('mail.from.address'));
        if (!$from) {
            throw new \RuntimeException('OTP is enabled, but MAIL_FROM_ADDRESS is missing.');
        }

        Mail::raw("Your Tuklas verification code is {$this->code}.\n\nThis code expires in 5 minutes.", function ($message): void {
            $message->to($this->email)->subject('Your Tuklas verification code');
        });
    }
}
