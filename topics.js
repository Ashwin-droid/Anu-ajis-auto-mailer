const rh = require(`./right-hand.js`);
require(`dotenv`).config();
const OpenAI = require(`openai`);

// Interpreter (editor)
module.exports.topicLabeller = async (processorCount = Infinity) => {
  const batches = await dataPreparer();
  console.log("Total number of batches: ", batches.length);
  var loopCount = 0;
  batches.forEach(async (batch, index) => {
    if (loopCount == processorCount) return;
    loopCount++;
    console.log("Processing batch number: ", index + 1);
    const labeledData = await AI_Labeller(batch);
    const processor = labeledData.map((label) => {
      return {
        category: label.category,
        targets: label.targets.map((id) => {
          return {
            title: batches[index].find((episode) => episode.id == id).title,
            id: batches[index].find((episode) => episode.id == id).episodeId
          };
        })
      };
    });
    processor.forEach(async (data) => {
      data.targets.forEach(async (episode) => {
        rh.buzzsprout.write(episode.id, {
          tags: data.category
        });
      });
    });
  });
};

module.exports.checkTags = async () => {
  const bzdata = await rh.buzzsprout.read();
  const tagCounts = bzdata.reduce((counts, episode) => {
    const tag = episode.tags.trim(); // remove any leading or trailing whitespace
    if (counts[tag]) {
      counts[tag]++;
    } else {
      counts[tag] = 1;
    }
    return counts;
  }, {});
  console.log(tagCounts);
}

async function AI_Labeller(batch) {
  const openai = new OpenAI.OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const reqiredData = batch.map((episode) => {
    return {
      title: episode.title,
      description: episode.description,
      id: episode.id
    };
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content:
          'You are a topics extractor. Your job is to process episode titles and descriptions into their relevant categories (provided below). Categories include `science, inventions, devotion, world, realism, saints, festivals, luminaries, environmental, kids, psychological, history` you will return in the following JSON response format. This format must strictly be maintained. DO NOT USE CODE BRACKETS. One episode can strictly have one category and one category only. No more and no less. Each episode must be strictly labelled once without exception and duplication. You are not allowed to leave any episode unlabeled. \n```\n{"data":[\n   {\n       "category": <cname>,\n       "targets": [<array containing all the integers IDs of relevant episodes>]\n   }\n]}\n```'
      },
      {
        role: "user",
        content: JSON.stringify(reqiredData)
      }
    ],
    temperature: 0,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    seed: 37,
    response_format: { type: "json_object" }
  });
  return JSON.parse(response.choices[0].message.content).data;
}

async function dataPreparer() {
  const bzdata = await rh.buzzsprout.read();
  var epCount = 0;
  const miniDataset = bzdata
    .map((episode) => {
      if (episode.tags.length == 0) {
        return {
          title: episode.title.split(":")[1],
          description: episode.description,
          id: epCount++,
          episodeId: episode.id
        };
      } else {
        return;
      }
    })
    .filter((e) => e != undefined);
  const batches = createBatches(miniDataset, 30);
  return batches;
}

function createBatches(array, batchSize) {
  let result = [];
  for (let i = 0; i < array.length; i += batchSize) {
    result.push(array.slice(i, i + batchSize));
  }
  return result;
}
