// Proxy for change password
export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await fetch('http://localhost:5001/api/Auth/user-change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
