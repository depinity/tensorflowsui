const YOUR_API_KEY = 'baMMOJA6OPy71mlpvhKCnlMWe9xlwM';

const fetchResponse = async (content) => {
  const response = await fetch('https://api.atoma.network/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${YOUR_API_KEY}`
    },
    body: JSON.stringify({
      stream: false,
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      messages: [{
        role: 'system',
        content: 'You are a number generator that only outputs a single random digit from 0 to 9 (like MNIST labels). Only respond with a single digit - no explanations or words.'
      },
      {
        role: 'user',
        content: 'Imagine random number in 0~9 about ' + content
      }],
      max_tokens: 128
    })
  });

  const data = await response.json();
  console.log('API Response:', data);
  return data;
};

// Example usage
fetchResponse('new york')
  .then(response => {
    const messageContent = response.choices[0].message.content;
    console.log('Answer:', messageContent);
  })
  .catch(console.error);