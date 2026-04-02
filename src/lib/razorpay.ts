import Razorpay from 'razorpay'

let instance: Razorpay | null = null

export function getRazorpayInstance(): Razorpay {
  if (!instance) {
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID ?? '',
      key_secret: process.env.RAZORPAY_KEY_SECRET ?? '',
    })
  }
  return instance
}

interface RazorpayWindow extends Window {
  Razorpay: {
    new (options: Record<string, unknown>): { open: () => void }
  }
}

export function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'))
      return
    }

    const existingScript = document.getElementById('razorpay-script')
    if (existingScript) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.id = 'razorpay-script'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
    document.body.appendChild(script)
  })
}

export function openRazorpayCheckout(options: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  const razorpayWindow = window as unknown as RazorpayWindow
  if (!razorpayWindow.Razorpay) {
    throw new Error('Razorpay SDK not loaded')
  }
  const rzp = new razorpayWindow.Razorpay(options)
  rzp.open()
}
