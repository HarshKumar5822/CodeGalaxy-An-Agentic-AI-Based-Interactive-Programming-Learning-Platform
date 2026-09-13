const mongoose = require('mongoose');
require('dotenv').config();

const Level = require('./models/Learning/Level');

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codegalaxy');
        console.log("Connected to DB");

        const challengeId = "69c22ce4408a72cc6763e041"; // From screenshot history
        
        // Let's find ALL levels and see their challenges
        const levels = await Level.find({});
        console.log(`Found ${levels.length} levels`);

        let found = false;
        for (const level of levels) {
            const challengesArray = level.challenges.map(id => id.toString());
            const index = challengesArray.indexOf(challengeId);
            if (index !== -1) {
                console.log(`Found challenge in level: "${level.title}" at index ${index}`);
                console.log(`Category: ${level.category}, LevelNumber: ${level.levelNumber}`);
                
                if (index < challengesArray.length - 1) {
                    console.log("NEXT Challenge ID (same level):", challengesArray[index+1]);
                } else {
                    console.log("Last challenge of level. Looking for levelNumber:", level.levelNumber + 1);
                    const nextLevel = await Level.findOne({ 
                        category: level.category, 
                        levelNumber: level.levelNumber + 1 
                    });
                    if (nextLevel && nextLevel.challenges.length > 0) {
                        console.log("NEXT Challenge ID (next level):", nextLevel.challenges[0].toString());
                    } else {
                        console.log("NO NEXT CHALLENGE FOUND");
                    }
                }
                found = true;
                break;
            }
        }
        
        if (!found) {
            console.log("Challenge ID not found in any level.");
            // Print first challenge of first level just for debugging
            if (levels.length > 0 && levels[0].challenges.length > 0) {
                console.log("First level first challenge example:", levels[0].challenges[0].toString());
            }
        }

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

test();
