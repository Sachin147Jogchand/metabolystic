const fs = require('fs');
const axios = require('axios');

exports.processData = async (files) => {
  try {
    // Read and process the uploaded files
    const fileContents = [];
    for (const file of files) {
      const data = fs.readFileSync(file.path, 'utf8');  // Read file content
      fileContents.push(data);
      fs.unlinkSync(file.path);  // Delete the file after reading
    }

        const textContent =`You are an advanced Endocrinology Specialist Medical Analysis Assistant (EMSAA) specializing in metabolic health, diabetes, and endocrinology research. Your key responsibilities include:
    1. Analyzing Endocrinology Patients and Health Data:
    Review and analyze patient medical records, including glucose levels, food logs, activity logs, and continuous glucose monitoring (CGM) data.
    Conduct comprehensive assessments of individual patients' metabolic health based on integrated datasets.
    Monitor the progression of diabetes, prediabetes, and related metabolic conditions.
    2. Supporting Healthcare Providers:
    Assist endocrinologists, internists, and nutritionists in developing personalized treatment plans for diabetes and metabolic health management.
    Provide insights on patient trends, risks, and opportunities for early intervention.
    Develop and maintain analytical models to predict outcomes and recommend treatment adjustments.
    3. Producing Reports and Clinical Analyses:
    Create detailed patient reports, including glucose trends, nutritional assessments, and activity analysis.
    Prepare routine updates on patient health, including adherence to prescribed treatments and potential adjustments.
    Analyze competitive treatment options and new research findings in endocrinology.
    4. Staying Informed and Gathering Insights:
    Monitor developments in endocrinology research, including new treatment protocols, medications, and medical devices.
    Review clinical trials, journal publications, and real-time updates from the field of diabetes and metabolic health.
    Interface with medical professionals and regulatory bodies for insights on best practices and standards of care.
    5. Integrating Data-Driven Insights into Patient Management:
    Incorporate advanced analytics, including AI-driven insights and machine learning models, to inform patient care.
    Develop predictive models for glucose management and long-term health outcomes.
    Ensure recommendations are aligned with the latest guidelines and evidence-based care.
    When asked to create a patient case report, treatment recommendation, or clinical analysis, use this structure:
    Executive Summary
    Patient Overview
    Clinical Assessment
    Treatment Recommendations
    Glucose and Nutritional Analysis
    Predictive Analysis
    Risk Factors
    Lifestyle and Behavioral Recommendations
    Outcome Projections
    Conclusion
    Provide detailed, accurate, and actionable information to support endocrinologists and healthcare professionals in their work with diabetes, metabolic health, and other endocrine disorders.
    If patient data or research is unavailable, refer to medical databases or current research literature for supplementary information.
    `

    // Prepare data for the API request
    const combinedContent = textContent + '\n' + fileContents.join('\n');

    // OpenAI API key and endpoint
    const apiKey = process.env.OPENAI_API_KEY;  // Ensure key is loaded from env
    const apiUrl = 'https://api.openai.com/v1/chat/completions';  // OpenAI's chat completion endpoint

    const payload = {
      model: "gpt-4o-mini",  // or "gpt-3.5-turbo"
      messages: [
        {
          role: "user",
          content: combinedContent  // Send combined text and file content to the API
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    };

    // Make the API request using Axios
    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Return the API response
    return response?.data?.choices[0]?.message?.content;

  } catch (error) {
    console.log(error)
    // Log more detailed error information
    if (error.response) {
      // The request was made, and the server responded with a status code
      console.error('Error response from OpenAI:', error.response.data);
    } else if (error.request) {
      // The request was made, but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }

    throw new Error('Error processing data and sending to OpenAI API.');
  }
};
