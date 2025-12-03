import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { applicationSteps } from "@/lib/mockData";

export default function TrackerPage() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Application Tracker</h1>
          <p className="text-lg text-gray-600 mb-8">
            Monitor your visa application progress step by step.
          </p>

          {/* Progress Overview */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Progress</h2>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: "0%" }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">0 of {applicationSteps.length} steps completed</p>
          </Card>

          {/* Application Steps */}
          <div className="space-y-4">
            {applicationSteps.map((step, index) => (
              <Card 
                key={step.id}
                className={`p-6 border-l-4 ${
                  step.completed 
                    ? "border-l-green-500 bg-green-50" 
                    : "border-l-blue-500 bg-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 mt-1">{step.description}</p>
                  </div>
                  <div>
                    <input 
                      type="checkbox" 
                      defaultChecked={step.completed}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Document Checklist */}
          <Card className="p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Document Checklist</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 cursor-pointer" />
                <span className="text-gray-700">Passport</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 cursor-pointer" />
                <span className="text-gray-700">Birth Certificate</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 cursor-pointer" />
                <span className="text-gray-700">Educational Documents</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 cursor-pointer" />
                <span className="text-gray-700">Financial Proof</span>
              </label>
            </div>
          </Card>
        </section>
      </main>
    </>
  );
}
