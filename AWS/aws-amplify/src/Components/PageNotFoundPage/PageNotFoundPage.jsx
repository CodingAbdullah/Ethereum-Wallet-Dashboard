import React from 'react';
import { useNavigate } from 'react-router-dom';

const PageNotFound = () => {
    const navigate = useNavigate();

    return (
        <div className='page-not-found'>
            <main role="main" class="p-3">
                <h1 style={{ marginTop: '2rem' }}>Page Not Found</h1>
                <button style={{ marginTop: '2.5rem' }} class="btn btn-success" onClick={() => navigate("/")}>Go Home</button>
            </main>
        </div>
    )
}

export default PageNotFound;