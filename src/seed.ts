import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PlayersService } from './players/players.service';
import { TeamsService } from './teams/teams.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const playersService = app.get(PlayersService);
  const teamsService = app.get(TeamsService);

  console.log('🌱 Starting database seeding...\n');

  try {
    // Create 4 teams
    console.log('Creating teams...');
    const teams = [];
    const teamNames = [
      'Mumbai Indians',
      'Chennai Super Kings',
      'Royal Challengers',
      'Kolkata Knight Riders',
    ];

    for (const teamName of teamNames) {
      const team = await teamsService.create({
        name: teamName,
        budget: 100,
        players: [],
      });
      teams.push(team);
      console.log(`✅ Created team: ${team.name}`);
    }

    console.log('\nCreating 28 players...');

    // Create 28 players with different positions and base prices
    const playerData = [
      // Batsmen (10 players)
      { name: 'Virat Kohli', position: 'Batsman', basePrice: 15 },
      { name: 'Rohit Sharma', position: 'Batsman', basePrice: 14 },
      { name: 'KL Rahul', position: 'Batsman', basePrice: 12 },
      { name: 'David Warner', position: 'Batsman', basePrice: 11 },
      { name: 'Steve Smith', position: 'Batsman', basePrice: 10 },
      { name: 'AB de Villiers', position: 'Batsman', basePrice: 13 },
      { name: 'Jos Buttler', position: 'Batsman', basePrice: 9 },
      { name: 'Quinton de Kock', position: 'Batsman', basePrice: 8 },
      { name: 'Shikhar Dhawan', position: 'Batsman', basePrice: 7 },
      { name: 'Faf du Plessis', position: 'Batsman', basePrice: 6 },

      // All-rounders (8 players)
      { name: 'Hardik Pandya', position: 'All-rounder', basePrice: 12 },
      { name: 'Ben Stokes', position: 'All-rounder', basePrice: 11 },
      { name: 'Andre Russell', position: 'All-rounder', basePrice: 10 },
      { name: 'Ravindra Jadeja', position: 'All-rounder', basePrice: 9 },
      { name: 'Glenn Maxwell', position: 'All-rounder', basePrice: 8 },
      { name: 'Shakib Al Hasan', position: 'All-rounder', basePrice: 7 },
      { name: 'Moeen Ali', position: 'All-rounder', basePrice: 6 },
      { name: 'Marcus Stoinis', position: 'All-rounder', basePrice: 5 },

      // Bowlers (10 players)
      { name: 'Jasprit Bumrah', position: 'Bowler', basePrice: 12 },
      { name: 'Rashid Khan', position: 'Bowler', basePrice: 11 },
      { name: 'Kagiso Rabada', position: 'Bowler', basePrice: 10 },
      { name: 'Pat Cummins', position: 'Bowler', basePrice: 9 },
      { name: 'Trent Boult', position: 'Bowler', basePrice: 8 },
      { name: 'Yuzvendra Chahal', position: 'Bowler', basePrice: 7 },
      { name: 'Mohammed Shami', position: 'Bowler', basePrice: 6 },
      { name: 'Bhuvneshwar Kumar', position: 'Bowler', basePrice: 5 },
      { name: 'Sunil Narine', position: 'Bowler', basePrice: 4 },
      { name: 'Kuldeep Yadav', position: 'Bowler', basePrice: 3 },
    ];

    for (const player of playerData) {
      const createdPlayer = await playersService.create({
        name: player.name,
        position: player.position,
        basePrice: player.basePrice,
      });
      console.log(
        `✅ Created player: ${createdPlayer.name} (${createdPlayer.position}) - Base Price: ${createdPlayer.basePrice}`,
      );
    }

    console.log('\n✨ Seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Teams created: ${teams.length}`);
    console.log(`   - Players created: ${playerData.length}`);
    console.log(`   - Total budget per team: 100`);
    console.log('\n🚀 Ready to start the auction!\n');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seed()
  .then(() => {
    console.log('👋 Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed script failed:', error);
    process.exit(1);
  });
