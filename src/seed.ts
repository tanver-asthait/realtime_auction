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
    // Using small base64 placeholder images (1x1 pixel colored squares for demo)
    const playerImages = {
      goalkeeper: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/58BAgjgAeKoqKgAAAAASUVORK5CYII=', // Yellow
      defender: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9hpuSeQAAAABJRU5ErkJggg==', // Blue
      midfielder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', // Green
      forward: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP4P50BAgjgAeKoqKgAAAAASUVORK5CYII=' // Red
    };

    const playerData = [
      // Goal Keepers (3 players)
      { name: 'Manuel Neuer', position: 'Goal Keeper', basePrice: 8, image: playerImages.goalkeeper },
      { name: 'Alisson Becker', position: 'Goal Keeper', basePrice: 7, image: playerImages.goalkeeper },
      { name: 'Jan Oblak', position: 'Goal Keeper', basePrice: 6, image: playerImages.goalkeeper },

      // Defenders (8 players)
      { name: 'Virgil van Dijk', position: 'Defender', basePrice: 12, image: playerImages.defender },
      { name: 'Sergio Ramos', position: 'Defender', basePrice: 10, image: playerImages.defender },
      { name: 'Kalidou Koulibaly', position: 'Defender', basePrice: 9, image: playerImages.defender },
      { name: 'Andrew Robertson', position: 'Defender', basePrice: 8, image: playerImages.defender },
      { name: 'Trent Alexander-Arnold', position: 'Defender', basePrice: 8, image: playerImages.defender },
      { name: 'Raphael Varane', position: 'Defender', basePrice: 7, image: playerImages.defender },
      { name: 'Giorgio Chiellini', position: 'Defender', basePrice: 6, image: playerImages.defender },
      { name: 'Thiago Silva', position: 'Defender', basePrice: 5, image: playerImages.defender },

      // Midfielders (9 players)
      { name: 'Kevin De Bruyne', position: 'Midfielder', basePrice: 15, image: playerImages.midfielder },
      { name: 'Luka Modrić', position: 'Midfielder', basePrice: 12, image: playerImages.midfielder },
      { name: 'Kanté', position: 'Midfielder', basePrice: 11, image: playerImages.midfielder },
      { name: 'Joshua Kimmich', position: 'Midfielder', basePrice: 10, image: playerImages.midfielder },
      { name: 'Bruno Fernandes', position: 'Midfielder', basePrice: 9, image: playerImages.midfielder },
      { name: 'Jordan Henderson', position: 'Midfielder', basePrice: 7, image: playerImages.midfielder },
      { name: 'Casemiro', position: 'Midfielder', basePrice: 6, image: playerImages.midfielder },
      { name: 'Paul Pogba', position: 'Midfielder', basePrice: 5, image: playerImages.midfielder },
      { name: 'Frenkie de Jong', position: 'Midfielder', basePrice: 4, image: playerImages.midfielder },

      // Forwards (8 players)
      { name: 'Lionel Messi', position: 'Forward', basePrice: 20, image: playerImages.forward },
      { name: 'Cristiano Ronaldo', position: 'Forward', basePrice: 18, image: playerImages.forward },
      { name: 'Kylian Mbappé', position: 'Forward', basePrice: 16, image: playerImages.forward },
      { name: 'Erling Haaland', position: 'Forward', basePrice: 14, image: playerImages.forward },
      { name: 'Robert Lewandowski', position: 'Forward', basePrice: 13, image: playerImages.forward },
      { name: 'Mohamed Salah', position: 'Forward', basePrice: 12, image: playerImages.forward },
      { name: 'Sadio Mané', position: 'Forward', basePrice: 10, image: playerImages.forward },
      { name: 'Harry Kane', position: 'Forward', basePrice: 9, image: playerImages.forward },
    ];

    for (const player of playerData) {
      const createdPlayer = await playersService.create({
        name: player.name,
        position: player.position,
        basePrice: player.basePrice,
        image: player.image,
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
