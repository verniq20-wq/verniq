/**
 * Activity bank used by the lesson composer. Every section has several
 * variants so a teacher can regenerate one section and get a genuinely
 * different, classroom-ready idea. Scripts are in Hindi; steps are short
 * English instructions for the teacher. Slots: {topic} {w1} {w2} {w3} {n} {obj}.
 */
import type { ActivityTag, LessonSectionKey } from './types';

export type Family = 'number' | 'space' | 'lifemath' | 'language' | 'evs';

export interface Variant {
  script: string;
  steps: string[];
  materials?: string[];
}

export function familyFor(tags: ActivityTag[]): Family {
  const t = new Set(tags);
  if (['shapes', 'measurement'].some((x) => t.has(x as ActivityTag))) return 'space';
  if (['money', 'time', 'data', 'fractions'].some((x) => t.has(x as ActivityTag))) return 'lifemath';
  if (['counting', 'number-sense', 'operations', 'patterns'].some((x) => t.has(x as ActivityTag))) return 'number';
  if (['vocabulary', 'phonics', 'reading', 'writing', 'speaking', 'story'].some((x) => t.has(x as ActivityTag))) return 'language';
  return 'evs';
}

export const BANK: Record<Family, Record<LessonSectionKey, Variant[]>> = {
  number: {
    introduction: [
      { script: 'आज हम {topic} सीखेंगे। अपनी दोनों हथेलियाँ दिखाओ — चलो साथ में उँगलियाँ गिनते हैं!', steps: ['Greet the class in both languages', 'Everyone holds up both hands', 'Count fingers together slowly, first in the home language, then in Hindi'] },
      { script: 'मेरे थैले में कुछ {obj} छुपे हैं। अंदाज़ा लगाओ — कितने होंगे? चलो गिनकर देखते हैं।', steps: ['Show a closed bag of {obj}', 'Take three guesses from children', 'Count them out together and check who was closest'], materials: ['A bag of {obj}'] },
      { script: 'गिनती वाला गीत गाते हैं! हर संख्या पर ताली बजाना।', steps: ['Sing a counting song the children know', 'Clap once on every number', 'Ask: which number did we stop at?'] },
    ],
    explain: [
      { script: 'देखो, मैं {obj} एक-एक करके रखती हूँ। हर बार अगली संख्या बोलेंगे — {w1}, {w2}, {w3}…', steps: ['Place objects one by one on the floor', 'Say each number in Hindi, then in the home language', 'Write the numeral on the board next to the group'], materials: ['{obj}', 'Chalk'] },
      { script: 'इस चार्ट को देखो। हर खाने में उतनी ही चीज़ें हैं जितनी संख्या लिखी है।', steps: ['Show a number chart with pictures', 'Point to each numeral and count its pictures aloud', 'Ask children to find a number you call out'], materials: ['Number chart'] },
      { script: 'संख्या सिर्फ़ गिनती नहीं है — यह बताती है कि कितनी चीज़ें हैं। {n} का मतलब {n} चीज़ें।', steps: ['Make groups of different sizes with {obj}', 'Match each group to its number card', 'Explain that the last number counted tells how many'] },
    ],
    activity: [
      { script: 'चलो खेल खेलते हैं! मैं संख्या बोलूँगी, तुम उतनी बार ताली बजाओ।', steps: ['Call out a number in the home language', 'Children clap that many times', 'Let a child take the teacher role'] },
      { script: 'छोटे समूह बनाओ। हर समूह {n} तक की चीज़ें ढूँढकर लाएगा और गिनकर दिखाएगा।', steps: ['Form groups of four', 'Each group collects items from the classroom or yard', 'Groups count aloud and place their number card'], materials: ['Number cards'] },
      { script: 'गोल घेरा बनाओ। गेंद जिसके पास जाएगी, वह अगली संख्या बोलेगा।', steps: ['Children sit in a circle', 'Pass a ball; each child says the next number', 'Start again from a new number to make it harder'], materials: ['A soft ball'] },
    ],
    practice: [
      { script: 'अब अपनी स्लेट पर संख्याएँ लिखो। जो संख्या छूट गई है, उसे भरो।', steps: ['Trace numbers on slates', 'Fill the missing number in a sequence on the board', 'Pairs check each other’s slates'], materials: ['Slates'] },
      { script: 'मिट्टी या रेत पर उँगली से संख्या बनाओ और उतने ही {obj} रखो।', steps: ['Use sand, soil or a tray', 'Draw a numeral with a finger', 'Place the same number of objects beside it'] },
      { script: 'अपने साथी को संख्या बोलो, वह उतनी बार कूदेगा।', steps: ['Work in pairs', 'One child says a number, the other jumps that many times', 'Swap roles'] },
    ],
    assessment: [
      { script: 'मुझे दिखाओ — {n} {obj} कहाँ हैं? {w2} के बाद कौन सी संख्या आती है?', steps: ['Ask each child to point to a group you name', 'Ask “what comes after…?” questions', 'Note children who need another round'] },
      { script: 'मैं कार्ड उठाऊँगी — तुम उसका नाम दोनों भाषाओं में बोलो।', steps: ['Flash number cards in random order', 'Children say the name in both languages', 'Mark who answers confidently'] },
      { script: 'कौन सी संख्या गायब है? ध्यान से देखो और बताओ।', steps: ['Write a sequence with one number missing', 'Children write the missing number', 'Collect slates and note errors'] },
    ],
  },
  space: {
    introduction: [
      { script: 'आज हम {topic} के बारे में सीखेंगे। कक्षा में चारों ओर देखो — तुम्हें कौन-कौन सी आकृतियाँ दिखती हैं?', steps: ['Ask children to look around the room', 'Collect answers in the home language', 'List the objects on the board'] },
      { script: 'यह थैला खोलो और बिना देखे एक चीज़ छूकर बताओ — यह कैसी है?', steps: ['Put everyday objects in a bag', 'Children feel one object without looking', 'They describe its shape or size'], materials: ['A bag of everyday objects'] },
    ],
    explain: [
      { script: 'देखो, यह {w1} है, यह {w2} है और यह {w3}। हर एक के किनारे और कोने गिनो।', steps: ['Draw each shape large on the board', 'Count sides and corners together', 'Match each to an object in the room'] },
      { script: 'दो चीज़ें लो और तुलना करो — कौन लंबी है, कौन छोटी? कौन भारी है?', steps: ['Hold up two objects side by side', 'Use comparison words in both languages', 'Let children order three objects'] },
    ],
    activity: [
      { script: 'मैदान में चलकर {w1} बनाओ! सब मिलकर आकृति के किनारों पर खड़े हो जाओ।', steps: ['Go outside or clear space', 'Children form the shape with their bodies', 'Others guess the shape'] },
      { script: 'अपने बित्ते से मेज़ नापो। किसकी मेज़ सबसे लंबी है?', steps: ['Show how to measure with a hand span', 'Pairs measure desks or the door', 'Record results on the board'] },
    ],
    practice: [
      { script: 'स्लेट पर {w1}, {w2} और {w3} बनाओ और हर एक के पास एक चीज़ का नाम लिखो।', steps: ['Children draw the shapes', 'Label with a real-life example', 'Share with a partner'] },
      { script: 'चित्र में छुपी आकृतियाँ ढूँढो और गिनो।', steps: ['Show a picture made of shapes', 'Children count each shape', 'Check answers together'] },
    ],
    assessment: [
      { script: 'मैं जो आकृति बोलूँ, उसे कक्षा में ढूँढकर छुओ।', steps: ['Call out a shape', 'Children touch a matching object', 'Note who hesitates'] },
      { script: 'इन दो चीज़ों में कौन लंबी है? कैसे पता चला?', steps: ['Ask comparison questions', 'Listen for correct words', 'Record understanding'] },
    ],
  },
  lifemath: {
    introduction: [
      { script: 'आज हम {topic} सीखेंगे। घर पर यह कहाँ काम आता है? कौन बताएगा?', steps: ['Ask where children see this at home or in the market', 'Collect answers in the home language', 'Link to today’s topic'] },
      { script: 'चलो एक छोटी कहानी सुनते हैं — मेले में रानी क्या-क्या खरीदती है?', steps: ['Tell a short story set in a local market', 'Pause to ask quantity questions', 'Introduce the key idea'] },
    ],
    explain: [
      { script: 'ध्यान से देखो। मैं असली चीज़ों से दिखाती हूँ कि {topic} कैसे काम करता है।', steps: ['Use real objects (coins, a clock, a calendar, a roti)', 'Show one clear example', 'Repeat with a second example'] },
      { script: 'बोर्ड पर देखो — हम इसे चित्र से समझेंगे, फिर संख्या से।', steps: ['Draw a picture model', 'Write the matching number sentence', 'Explain each step in both languages'] },
    ],
    activity: [
      { script: 'कक्षा में छोटी दुकान लगाते हैं! कुछ बच्चे दुकानदार बनेंगे, कुछ ग्राहक।', steps: ['Set up a pretend shop with price cards', 'Give play coins to buyers', 'Buyers and sellers check the change'], materials: ['Play coins', 'Price cards'] },
      { script: 'हर समूह अपनी कक्षा के बारे में आँकड़े इकट्ठा करेगा और मिलान चिह्न लगाएगा।', steps: ['Pick a question (favourite fruit, how children come to school)', 'Groups ask classmates and make tally marks', 'Share the totals'] },
    ],
    practice: [
      { script: 'अपनी स्लेट पर तीन सवाल हल करो। पहले चित्र बनाओ, फिर उत्तर लिखो।', steps: ['Write three problems on the board', 'Children solve with drawings first', 'Pairs compare answers'] },
      { script: 'अपने साथी को एक सवाल बनाकर दो, वह उसे हल करेगा।', steps: ['Each child makes a problem', 'Partner solves it', 'Swap and check'] },
    ],
    assessment: [
      { script: 'यह हल करके दिखाओ और बताओ तुमने कैसे सोचा।', steps: ['Give one problem to each child', 'Ask them to explain their thinking', 'Note methods and mistakes'] },
      { script: 'तीन छोटे सवाल — अंगूठा ऊपर अगर आसान लगा, नीचे अगर मुश्किल।', steps: ['Ask three quick oral questions', 'Thumbs up/down self-check', 'Plan support for thumbs-down children'] },
    ],
  },
  language: {
    introduction: [
      { script: 'आज हम {topic} सीखेंगे। पहले एक गीत गाते हैं जिसमें ये आवाज़ें आती हैं।', steps: ['Sing a short rhyme with today’s sounds or words', 'Children repeat each line', 'Ask which sounds they heard'] },
      { script: 'इस चित्र को देखो। इसमें क्या-क्या दिख रहा है? अपनी भाषा में बताओ।', steps: ['Show a picture card', 'Children name things in the home language', 'Say the Hindi words alongside'], materials: ['Picture card'] },
      { script: 'मैं एक छोटी कहानी सुनाती हूँ। ध्यान से सुनना, बाद में सवाल पूछूँगी।', steps: ['Tell a 2-minute story with today’s words', 'Use gestures and pictures', 'Ask one question to check listening'] },
    ],
    explain: [
      { script: 'देखो — {w1}, {w2}, {w3}। हर शब्द को पहले अपनी भाषा में बोलो, फिर हिंदी में।', steps: ['Write each word on the board with a picture', 'Say it slowly, clap the syllables', 'Children repeat in both languages'] },
      { script: 'यह अक्षर देखो और इसकी आवाज़ सुनो। कौन से शब्द इस आवाज़ से शुरू होते हैं?', steps: ['Write the letter large', 'Model its sound', 'Collect words that start with it from children'] },
    ],
    activity: [
      { script: 'शब्द-खेल! मैं चित्र दिखाऊँगी, जो पहले सही शब्द बोलेगा उसकी टीम को अंक मिलेगा।', steps: ['Split the class into two teams', 'Show picture cards one by one', 'Accept answers in either language, then ask for Hindi'], materials: ['Picture cards'] },
      { script: 'जोड़ी में बैठो और एक-दूसरे को अपने बारे में तीन बातें बताओ।', steps: ['Pairs take turns speaking', 'Use sentence starters on the board', 'Two pairs share with the class'] },
      { script: 'कहानी को अभिनय करके दिखाते हैं! हर बच्चा एक पात्र बनेगा।', steps: ['Assign simple roles', 'Children act out the story', 'Audience retells what happened'] },
    ],
    practice: [
      { script: 'स्लेट पर आज के शब्द लिखो और हर शब्द के पास उसका चित्र बनाओ।', steps: ['Children copy the words', 'Draw a picture beside each', 'Read them aloud to a partner'], materials: ['Slates'] },
      { script: 'मैं शब्द बोलूँगी, तुम लिखो। फिर अपने साथी से मिलाकर देखो।', steps: ['Dictate 4–5 words slowly', 'Children write on slates', 'Pairs check and correct'] },
    ],
    assessment: [
      { script: 'यह चित्र देखकर इसका नाम दोनों भाषाओं में बताओ।', steps: ['Show pictures one by one', 'Children name them in both languages', 'Note who needs help'] },
      { script: 'कहानी में क्या हुआ? तीन वाक्यों में बताओ।', steps: ['Ask two or three children to retell', 'Listen for sequence and new words', 'Record understanding'] },
    ],
  },
  evs: {
    introduction: [
      { script: 'आज हम {topic} के बारे में बात करेंगे। तुम्हारे घर या गाँव में यह कहाँ दिखता है?', steps: ['Ask children to share from home and village life', 'Accept answers in the home language', 'Write key words on the board in both languages'] },
      { script: 'चलो बाहर चलकर देखते हैं। जो भी दिखे, उसे ध्यान से देखो और याद रखो।', steps: ['Take a short walk in the school yard', 'Children observe and remember three things', 'Return and list them'] },
      { script: 'इस पहेली का उत्तर बताओ! — मैं कौन हूँ?', steps: ['Tell a riddle about today’s topic', 'Children guess in any language', 'Reveal the answer with a picture'] },
    ],
    explain: [
      { script: 'देखो, ये हैं {w1}, {w2} और {w3}। हर एक के बारे में एक बात बताओ।', steps: ['Show pictures or real objects', 'Say names in both languages', 'Ask one question about each'] },
      { script: 'हम इन्हें दो समूहों में बाँटेंगे। सोचो — कौन किस समूह में जाएगा और क्यों?', steps: ['Draw two circles on the floor or board', 'Sort pictures together', 'Explain the reason for each choice'] },
    ],
    activity: [
      { script: 'हर समूह को एक चित्र-कार्ड मिलेगा। उसके बारे में आपस में बात करो और कक्षा को बताओ।', steps: ['Give each group a picture card', 'Groups discuss what they know', 'Each group shares one fact'], materials: ['Picture cards'] },
      { script: 'अपने आसपास से {obj} इकट्ठा करो और उन्हें समूहों में लगाओ।', steps: ['Collect safe natural objects', 'Sort them by a rule the group chooses', 'Explain the rule to the class'] },
      { script: 'अभिनय करो! मैं नाम बोलूँगी, तुम उसकी नकल करके दिखाओ।', steps: ['Call out animals, jobs or actions', 'Children act them out', 'Others guess and name in both languages'] },
    ],
    practice: [
      { script: 'अपनी स्लेट पर आज की तीन चीज़ों का चित्र बनाओ और नाम लिखो।', steps: ['Children draw three things', 'Label in Hindi (and home language if they can)', 'Show a partner'] },
      { script: 'मैं जो बोलूँ, अगर सही है तो खड़े हो जाओ, गलत है तो बैठे रहो।', steps: ['Say true or false statements', 'Children stand or sit', 'Discuss any statement many got wrong'] },
    ],
    assessment: [
      { script: 'बताओ — तुमने आज क्या नया सीखा? एक बात अपनी भाषा में, एक हिंदी में।', steps: ['Ask each child for one new thing', 'Encourage both languages', 'Note children who stay silent'] },
      { script: 'यह चित्र किस समूह में जाएगा? क्यों?', steps: ['Show three pictures', 'Children place them in the right group', 'Record who explains the reason'] },
    ],
  },
};

/** Local, free materials for {obj}, by family. */
export const OBJECTS: Record<Family, string[]> = {
  number: ['पत्थर', 'बीज', 'पत्ते', 'इमली के बीज', 'कंकड़'],
  space: ['डंडियाँ', 'पत्ते', 'धागा'],
  lifemath: ['सिक्के', 'पत्ते', 'कंकड़'],
  language: ['चित्र-कार्ड', 'पत्ते'],
  evs: ['पत्ते', 'फूल', 'बीज', 'कंकड़'],
};
