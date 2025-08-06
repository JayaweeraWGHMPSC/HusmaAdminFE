// Proxy for getting user details by email
export async function GET(request, { params }) {
  try {
    const { email } = await params;
    
    const response = await fetch(`http://localhost:5001/api/Auth/user/${email}`, {
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

// Proxy for updating user details
export async function PUT(request, { params }) {
  try {
    const { email } = await params;
    const body = await request.json();
    
    const response = await fetch(`http://localhost:5001/api/Auth/user/${email}`, {
      method: 'PUT',
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

// Proxy for deleting user
export async function DELETE(request, { params }) {
  try {
    const { email } = await params;
    
    const response = await fetch(`http://localhost:5001/api/Auth/user/${email}`, {
      method: 'DELETE',
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
