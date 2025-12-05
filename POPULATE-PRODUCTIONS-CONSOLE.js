// PASTE THIS IN BROWSER CONSOLE WHILE LOGGED INTO ADMIN PANEL
// This will populate all production data into the API

const upcomingProductions = [
  { production: 'The Glass Menagerie', director: 'Kimberly Braun', company: 'Maples Repertory Theatre', year: '2025' },
  { production: 'Million Dollar Quartet', director: 'James Moye', company: 'South Coast Repertory Theatre', year: '2025' },
  { production: 'How to Succeed in Business', director: 'Bernie Monroe', company: 'Okoboji Summer Theatre', year: '2025' },
  { production: 'Deathtrap', director: 'Fred Rubeck', company: 'Okoboji Summer Theatre', year: '2025' },
  { production: 'Bell, Book, and Candle', director: 'Richard Biever', company: 'Okoboji Summer Theatre', year: '2025' },
  { production: "All's Well That Ends Well", director: 'Rob Salas', company: 'New Swan Theatre Festival', year: '2025' },
  { production: 'Much Ado About Nothing', director: 'Eli Simon', company: 'New Swan Theatre Festival', year: '2025' },
  { production: 'Less Miserable', director: 'John Keating', company: 'The Great American Melodrama', year: '2025' },
  { production: 'Romero', director: 'David Crespy', company: 'University of Missouri', year: '2025' },
  { production: 'Shut Up, Sherlock!', director: 'Eric Hoit', company: 'The Great American Melodrama', year: '2025' },
  { production: 'Guys on Ice', director: 'Dan Kalrer', company: 'The Great American Melodrama', year: '2025' },
];

const recentProductions = [
  { production: 'Clue On Stage', director: 'John Hemphill', company: 'Stephens College', year: '2024' },
  { production: 'Urinetown', director: 'Joy Powell', company: 'University of Missouri', year: '2024' },
  { production: 'The Music Man', director: 'Bernie Monroe', company: 'Okoboji Summer Theatre', year: '2024' },
  { production: 'Barefoot in The Park', director: 'Brett Olson', company: 'Okoboji Summer Theatre', year: '2024' },
  { production: 'Freaky Friday', director: 'Josh Walden', company: 'Okoboji Summer Theatre', year: '2024' },
  { production: 'Baskerville: A Sherlock Holmes Mystery', director: 'Stephen Brotebeck', company: 'Okoboji Summer Theatre', year: '2024' },
  { production: '9 to 5', director: 'Brandon Riley', company: 'University of Missouri', year: '2024' },
  { production: 'Footloose', director: 'Jamey Grisham', company: 'Stephens College', year: '2024' },
  { production: 'Boeing, Boeing', director: 'John Hemphill', company: 'Stephens College', year: '2024' },
  { production: 'Bright Star', director: "Andre' Rodriguez", company: 'Denver School of the Arts', year: '2024' },
  { production: 'Christmas Carol', director: 'Courtney Crouse', company: 'Stephens College', year: '2023' },
  { production: 'An Enemy of The People', director: 'LR Hults', company: 'Stephens College', year: '2023' },
  { production: 'Songs For a New World', director: 'Lisa Brescia', company: 'Stephens College', year: '2023' },
  { production: 'The Wedding Singer', director: 'Bernie Monroe', company: 'Okoboji Summer Theatre', year: '2023' },
  { production: 'Dial "M" For Murder', director: 'Fred Rubeck', company: 'Okoboji Summer Theatre', year: '2023' },
  { production: 'Cole', director: 'Alison Morooney', company: 'Okoboji Summer Theatre', year: '2023' },
  { production: 'Head Over Heels', director: 'Josh Walden', company: 'Theatre SilCo', year: '2023' },
  { production: 'Curtain Up! Stephens', director: 'Lisa Brescia', company: 'Stephens College', year: '2023' },
  { production: 'Lotería', director: 'Sara Rodriguez', company: 'Theatre SilCo', year: '2023' },
  { production: 'Spelling Bee', director: 'Todd Davidson', company: 'Stephens College', year: '2023' }
];

const assistantDesignProductions = [
  { production: 'The Play that Goes Wrong', designer: 'Tom Buderwitz', company: 'Seattle Rep', year: '2025' },
  { production: 'The Importance of Being Earnest', designer: 'Jo Winiarski', company: 'Utah Shakespeare Festival', year: '2025' },
  { production: "A Gentlemen's Guide to Love and Murder", designer: 'Jo Winiarski', company: 'Utah Shakespeare Festival', year: '2025' },
  { production: 'Steel Magnolias', designer: 'Jo Winiarski', company: 'Utah Shakespeare Festival', year: '2025' },
  { production: 'The Book Club Play', designer: 'Jo Winiarski', company: 'Cincinnati Playhouse in the Park', year: '2025' },
  { production: 'Souvenir', designer: 'Jo Winiarski', company: 'Pioneer Theatre', year: '2024' },
  { production: 'Ragtime', designer: 'Jo Winiarski', company: 'The Ruth: Hale Orem', year: '2024' },
  { production: 'Natasha, Pierre, and the Great Comet of 1812', designer: 'Jo Winiarski', company: 'Pioneer Theatre Company', year: '2024' },
  { production: 'Jersey Boys', designer: 'Jo Winiarski', company: 'Pioneer Theatre Company', year: '2024' },
  { production: 'Silent Sky', designer: 'Jo Winiarski', company: 'Utah Shakespeare Festival', year: '2024' }
];

const adminToken = sessionStorage.getItem('admin_token');
if (!adminToken) {
  console.error('❌ Not logged in! Please log into the admin panel first.');
} else {
  fetch('https://zuycsuajiuqsvopiioer.supabase.co/functions/v1/make-server-74296234/api/admin/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM',
      'X-Admin-Token': adminToken,
    },
    body: JSON.stringify({
      upcomingProductions,
      recentProductions,
      assistantDesignProductions,
    }),
  })
    .then(response => response.json())
    .then(data => {
      console.log('✅ SUCCESS! Production data populated!');
      console.log(`📊 ${upcomingProductions.length} upcoming productions`);
      console.log(`📊 ${recentProductions.length} recent productions`);
      console.log(`📊 ${assistantDesignProductions.length} assistant design productions`);
      console.log('🔄 Refresh the CV page to see all productions!');
    })
    .catch(error => {
      console.error('❌ Error:', error);
    });
}
