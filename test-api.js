// Quick test to check what the API returns
fetch('http://localhost:3000/api/projects')
    .then(res => res.json())
    .then(data => {
        console.log('API Response:', data);
        if (data.projects && data.projects.length > 0) {
            console.log('First project:', data.projects[0]);
            console.log('Has cardImage?', !!data.projects[0].cardImage);
            console.log('cardImage value:', data.projects[0].cardImage);
            console.log('Has card_image?', !!data.projects[0].card_image);
            console.log('card_image value:', data.projects[0].card_image);
        }
    })
    .catch(err => console.error('Error:', err));
