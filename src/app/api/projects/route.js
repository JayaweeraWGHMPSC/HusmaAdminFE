// Proxy for getting all projects
export async function GET(request) {
  try {
    const response = await fetch('http://localhost:5001/api/Project', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return Response.json(data, { 
      status: response.status,
      statusText: response.statusText 
    });
    
  } catch (error) {
    console.error('Proxy API error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
