'use client';

import { Card, CardHeader, CardContent } from "./ui/card"

export function Main() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 container mx-auto py-12 px-6">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Ace Your Next Interview</h2>
            <p className="text-muted-foreground">
              Our AI-powered interview assistant helps you prepare for job interviews by simulating realistic
              conversations and providing personalized feedback.
            </p>
            <button type="button" className="text-white bg-gradient-to-br from-black to-white hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Start Interview</button>
          </div>
          <div>
          </div>

        </section>
        <section className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <MicIcon className="w-8 h-8 text-primary" />
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-bold mb-2">Speech Recognition</h3>
                <p className="text-muted-foreground">
                  Our advanced speech recognition technology allows you to practice interviews using your own voice.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <WebcamIcon className="w-8 h-8 text-primary" />
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-bold mb-2">Conversational AI</h3>
                <p className="text-muted-foreground">
                  The AI assistant engages in dynamic, contextual conversations to simulate a realistic interview
                  experience.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <ReplyIcon className="w-8 h-8 text-primary" />
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-bold mb-2">Personalized Feedback</h3>
                <p className="text-muted-foreground">
                  Receive tailored feedback on your performance, including suggestions for improvement.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
        <section className="mt-12">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img src="https://miro.medium.com/v2/resize:fit:1400/1*OXFh0r4kD4k6SzPsax4HCA.gif" width={600} height={400} alt="How It Works" className="rounded-lg" />
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Step 1: Prepare</h3>
                <p className="text-muted-foreground">
                  Review common interview questions and practice your responses using the speech recognition feature.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Step 2: Simulate</h3>
                <p className="text-muted-foreground">
                  Engage in a simulated interview with our conversational AI assistant, which will ask dynamic questions
                  and provide real-time feedback.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Step 3: Improve</h3>
                <p className="text-muted-foreground">
                  Review the personalized feedback and insights to identify areas for improvement, then repeat the
                  process until you are confident and ready for your next interview.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function MicIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  )
}


function ReplyIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 17 4 12 9 7" />
      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
  )
}


function WebcamIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="10" r="8" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 22h10" />
      <path d="M12 22v-4" />
    </svg>
  )
}
