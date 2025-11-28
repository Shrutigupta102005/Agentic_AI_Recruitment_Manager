import React, { useState } from 'react';
import { FileText, Wand2, Copy, Download } from 'lucide-react';

export default function JobGenerator() {
  const [requirements, setRequirements] = useState('');
  const [generatedJD, setGeneratedJD] = useState<{
    markdown: string;
    json: any;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!requirements.trim()) return;

    setIsGenerating(true);

    try {
      const response = await fetch('/generate-jd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: requirements }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate JD');
      }

      const data = await response.json();

      // Parse the markdown to create a structured JSON (simplified for now)
      // In a real app, you might want the backend to return both or parse it more robustly
      const mockJson = {
        title: "Generated Role",
        department: "Engineering",
        location: "Remote/Hybrid",
        experience_level: "Mid-level",
        salary_range: "Competitive",
        requirements: requirements.split('\n').filter(r => r.trim()),
        responsibilities: ["See description"],
        qualifications: ["See description"]
      };

      setGeneratedJD({
        markdown: data.markdown,
        json: mockJson
      });
    } catch (error) {
      console.error('Error generating JD:', error);
      alert('Failed to generate job description. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Description Generator</h1>
        <p className="mt-2 text-gray-600">Generate comprehensive job descriptions from your requirements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Job Requirements Input
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Job Requirements
              </label>
              <textarea
                id="requirements"
                rows={12}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Enter the job requirements, skills, experience level, and any specific criteria...

Example:
- 3+ years of React experience
- Strong TypeScript skills
- Experience with Node.js
- Knowledge of database systems
- Excellent communication skills"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!requirements.trim() || isGenerating}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </div>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Job Description
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Output Section */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Generated Job Description</h2>

          {!generatedJD ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Generated job description will appear here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Markdown Format */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-medium text-gray-900">Markdown Format</h3>
                  <button
                    onClick={() => copyToClipboard(generatedJD.markdown)}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {generatedJD.markdown}
                  </pre>
                </div>
              </div>

              {/* JSON Format */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-medium text-gray-900">JSON Format</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(generatedJD.json, null, 2))}
                      className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </button>
                    <button className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {JSON.stringify(generatedJD.json, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}