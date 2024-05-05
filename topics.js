const rh = require(`./right-hand.js`);
require(`dotenv`).config();
const OpenAI = require(`openai`);

async function AI_Labeller(batch) {
  const openai = new OpenAI.OpenAI({
    apiKey: process.env.OPENAI_API_KEY
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
        content: JSON.stringify(batch)
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
  return response.choices[0].message.content;
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
