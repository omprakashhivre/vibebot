interface SpinnerProps {
    message?: string
  }
  
  export default function Spinner({ message = "Loading..." }: SpinnerProps) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background p-6 rounded-lg shadow-lg flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-foreground">{message}</p>
        </div>
      </div>
    )
  }
  
  