/**
 * Curriculum knowledge base for Classes 1–5.
 *
 * Outcomes are written by Verniq to follow the NCERT learning-outcome
 * framework and NIPUN Bharat foundational goals. Codes are Verniq's own
 * (subject prefix + class + number), not official NCERT codes.
 */
import type { Outcome, Subject } from './types';

const o = (
  code: string,
  grade: number,
  subject: Subject,
  statement: string,
  statementHi: string,
  topics: string[],
  keywords: string[],
  tags: Outcome['tags'],
): Outcome => ({ code, grade, subject, statement, statementHi, topics, keywords, tags });

export const OUTCOMES: Outcome[] = [
  // ─── Mathematics ─────────────────────────────────────────────
  o('M1.01', 1, 'Mathematics', 'Counts objects up to 20 and says the number names', 'वस्तुओं को 20 तक गिनता है और संख्याओं के नाम बोलता है', ['Numbers 1–10', 'Numbers 11–20', 'Counting objects'], ['count', 'counting', 'number', 'numbers', 'गिनती', 'संख्या', '1–10', 'one', 'ten'], ['counting', 'number-sense']),
  o('M1.02', 1, 'Mathematics', 'Recognises and writes numerals 1 to 9 and 0', 'अंक 0 से 9 पहचानता और लिखता है', ['Writing numbers', 'Number recognition', 'Zero'], ['numeral', 'write', 'recognition', 'recognise', 'zero', 'अंक', 'शून्य', 'पहचान'], ['number-sense', 'writing']),
  o('M1.03', 1, 'Mathematics', 'Compares two groups and uses more, less and equal', 'दो समूहों की तुलना करके ज़्यादा, कम और बराबर का उपयोग करता है', ['Bigger and Smaller', 'More and less', 'Comparing groups'], ['compare', 'more', 'less', 'bigger', 'smaller', 'equal', 'ज़्यादा', 'कम', 'बड़ा', 'छोटा', 'तुलना'], ['number-sense', 'counting']),
  o('M1.04', 1, 'Mathematics', 'Identifies circle, square and triangle in the surroundings', 'आसपास की चीज़ों में गोला, वर्ग और त्रिभुज पहचानता है', ['Shapes Around Us', 'Circle, square, triangle'], ['shape', 'shapes', 'circle', 'square', 'triangle', 'आकार', 'आकृति', 'गोला', 'त्रिभुज', 'वर्ग'], ['shapes', 'observation']),
  o('M1.05', 1, 'Mathematics', 'Adds and subtracts small numbers using objects', 'वस्तुओं की मदद से छोटी संख्याओं को जोड़ता और घटाता है', ['Addition up to 9', 'Subtraction up to 9', 'Putting together'], ['add', 'addition', 'subtract', 'subtraction', 'plus', 'minus', 'जोड़', 'घटाना', 'घटाव'], ['operations', 'counting']),
  o('M1.06', 1, 'Mathematics', 'Continues simple patterns of shapes, sounds and numbers', 'आकृतियों, आवाज़ों और संख्याओं के सरल पैटर्न आगे बढ़ाता है', ['Patterns', 'What comes next'], ['pattern', 'patterns', 'next', 'repeat', 'पैटर्न', 'क्रम', 'आगे'], ['patterns', 'number-sense']),
  o('M1.07', 1, 'Mathematics', 'Compares length and weight using words like long, short, heavy, light', 'लंबा, छोटा, भारी, हल्का जैसे शब्दों से लंबाई और वज़न की तुलना करता है', ['Long and short', 'Heavy and light'], ['long', 'short', 'heavy', 'light', 'length', 'weight', 'लंबा', 'भारी', 'हल्का'], ['measurement', 'observation']),
  o('M2.01', 2, 'Mathematics', 'Reads, writes and compares numbers up to 99', '99 तक की संख्याएँ पढ़ता, लिखता और तुलना करता है', ['Numbers up to 99', 'Tens and ones', 'Place value'], ['number', 'numbers', '99', 'tens', 'ones', 'place value', 'दहाई', 'इकाई', 'स्थानीय मान'], ['number-sense', 'counting']),
  o('M2.02', 2, 'Mathematics', 'Adds and subtracts two-digit numbers in daily-life problems', 'रोज़मर्रा की समस्याओं में दो अंकों की संख्याएँ जोड़ता और घटाता है', ['Addition', 'Subtraction', 'Word problems'], ['add', 'addition', 'subtract', 'subtraction', 'problem', 'जोड़', 'घटाव', 'सवाल'], ['operations']),
  o('M2.03', 2, 'Mathematics', 'Identifies coins and notes and uses them in small transactions', 'सिक्के और नोट पहचानता है और छोटे लेन-देन में उनका उपयोग करता है', ['Money', 'Coins and notes', 'Shopping'], ['money', 'coin', 'coins', 'note', 'rupee', 'shop', 'पैसे', 'सिक्के', 'रुपये', 'दुकान'], ['money', 'operations']),
  o('M2.04', 2, 'Mathematics', 'Names days of the week and months, and reads the calendar', 'सप्ताह के दिन और महीनों के नाम बताता है और कैलेंडर पढ़ता है', ['Days and months', 'Calendar', 'Time'], ['day', 'days', 'week', 'month', 'calendar', 'time', 'दिन', 'सप्ताह', 'महीना', 'समय'], ['time']),
  o('M2.05', 2, 'Mathematics', 'Measures length with non-standard units like hand span and footsteps', 'बित्ता और कदम जैसी इकाइयों से लंबाई नापता है', ['Measuring length', 'Hand span'], ['measure', 'length', 'span', 'step', 'नापना', 'बित्ता', 'कदम', 'लंबाई'], ['measurement']),
  o('M3.01', 3, 'Mathematics', 'Reads and writes numbers up to 999 and uses place value', '999 तक की संख्याएँ पढ़ता-लिखता है और स्थानीय मान समझता है', ['Numbers up to 999', 'Hundreds, tens and ones'], ['number', 'hundred', 'place value', '999', 'सैकड़ा', 'दहाई', 'इकाई'], ['number-sense']),
  o('M3.02', 3, 'Mathematics', 'Understands multiplication as repeated addition and learns tables up to 10', 'गुणा को बार-बार जोड़ के रूप में समझता है और 10 तक पहाड़े सीखता है', ['Multiplication', 'Tables'], ['multiply', 'multiplication', 'table', 'tables', 'times', 'गुणा', 'पहाड़ा'], ['operations', 'patterns']),
  o('M3.03', 3, 'Mathematics', 'Shares objects equally to understand division', 'वस्तुओं को बराबर बाँटकर भाग को समझता है', ['Division', 'Sharing equally'], ['divide', 'division', 'share', 'equal', 'भाग', 'बाँटना', 'बराबर'], ['operations', 'fractions']),
  o('M3.04', 3, 'Mathematics', 'Reads time on a clock to the hour and half hour', 'घड़ी में घंटा और आधा घंटा पढ़ता है', ['Time', 'Clock'], ['time', 'clock', 'hour', 'half', 'घड़ी', 'घंटा', 'समय'], ['time']),
  o('M3.05', 3, 'Mathematics', 'Collects data and shows it with tally marks and pictures', 'आँकड़े इकट्ठा करके मिलान चिह्न और चित्रों से दिखाता है', ['Data handling', 'Tally marks'], ['data', 'tally', 'chart', 'survey', 'आँकड़े', 'तालिका'], ['data', 'counting']),
  o('M4.01', 4, 'Mathematics', 'Multiplies and divides 2- and 3-digit numbers', '2 और 3 अंकों की संख्याओं का गुणा और भाग करता है', ['Multiplication', 'Division'], ['multiply', 'divide', 'multiplication', 'division', 'गुणा', 'भाग'], ['operations']),
  o('M4.02', 4, 'Mathematics', 'Understands halves, quarters and three-quarters', 'आधा, चौथाई और तीन-चौथाई समझता है', ['Fractions', 'Half and quarter'], ['fraction', 'half', 'quarter', 'भिन्न', 'आधा', 'चौथाई'], ['fractions']),
  o('M4.03', 4, 'Mathematics', 'Measures length, weight and capacity using standard units', 'मानक इकाइयों से लंबाई, वज़न और धारिता नापता है', ['Measurement', 'Metre and kilogram', 'Litre'], ['measure', 'metre', 'kilogram', 'litre', 'मीटर', 'किलो', 'लीटर'], ['measurement']),
  o('M4.04', 4, 'Mathematics', 'Finds perimeter of simple shapes by walking or measuring the boundary', 'सरल आकृतियों की परिधि सीमा नापकर निकालता है', ['Perimeter', 'Shapes and boundaries'], ['perimeter', 'boundary', 'shape', 'परिमाप', 'किनारा'], ['shapes', 'measurement']),
  o('M5.01', 5, 'Mathematics', 'Works with numbers beyond 1000 and estimates sums', '1000 से बड़ी संख्याओं पर काम करता है और जोड़ का अनुमान लगाता है', ['Large numbers', 'Estimation'], ['thousand', 'large number', 'estimate', 'हज़ार', 'अनुमान'], ['number-sense', 'operations']),
  o('M5.02', 5, 'Mathematics', 'Finds equivalent fractions and compares fractions', 'समतुल्य भिन्न ढूँढता है और भिन्नों की तुलना करता है', ['Fractions', 'Equivalent fractions'], ['fraction', 'equivalent', 'compare', 'भिन्न', 'समतुल्य'], ['fractions']),
  o('M5.03', 5, 'Mathematics', 'Finds area by counting squares and relates it to perimeter', 'वर्ग गिनकर क्षेत्रफल निकालता है और परिमाप से जोड़ता है', ['Area', 'Area and perimeter'], ['area', 'square', 'perimeter', 'क्षेत्रफल'], ['shapes', 'measurement']),
  o('M5.04', 5, 'Mathematics', 'Reads and draws bar graphs from collected data', 'इकट्ठा किए आँकड़ों से दंड आलेख पढ़ता और बनाता है', ['Data handling', 'Bar graphs'], ['bar graph', 'data', 'graph', 'आलेख', 'आँकड़े'], ['data']),

  // ─── Hindi ────────────────────────────────────────────────────
  o('H1.01', 1, 'Hindi', 'Recognises and sounds out Hindi vowels (स्वर)', 'हिंदी के स्वर पहचानता और बोलता है', ['स्वर — Vowels', 'अ से औ'], ['vowel', 'vowels', 'स्वर', 'अ', 'आ', 'letter'], ['phonics', 'vocabulary']),
  o('H1.02', 1, 'Hindi', 'Recognises consonants (व्यंजन) and joins them with vowel signs', 'व्यंजन पहचानता है और मात्राओं के साथ जोड़ता है', ['व्यंजन — Consonants', 'Matras'], ['consonant', 'consonants', 'व्यंजन', 'मात्रा', 'matra', 'क'], ['phonics', 'reading']),
  o('H1.03', 1, 'Hindi', 'Listens to rhymes and stories and answers simple questions', 'कविता और कहानी सुनकर सरल प्रश्नों के उत्तर देता है', ['Rhymes and Sounds', 'Story time'], ['rhyme', 'poem', 'story', 'listen', 'कविता', 'कहानी', 'सुनना'], ['story', 'speaking']),
  o('H1.04', 1, 'Hindi', 'Talks about self, family and surroundings in simple sentences', 'अपने, परिवार और आसपास के बारे में सरल वाक्यों में बात करता है', ['My Name', 'Talking about me'], ['name', 'myself', 'talk', 'नाम', 'मैं', 'बात'], ['speaking', 'vocabulary']),
  o('H2.01', 2, 'Hindi', 'Reads simple words and short sentences with understanding', 'सरल शब्द और छोटे वाक्य समझकर पढ़ता है', ['Reading words', 'Short sentences'], ['read', 'reading', 'word', 'sentence', 'पढ़ना', 'शब्द', 'वाक्य'], ['reading', 'phonics']),
  o('H2.02', 2, 'Hindi', 'Writes simple words and sentences from dictation and own ideas', 'बोले गए और अपने शब्द-वाक्य लिखता है', ['Writing words', 'Dictation'], ['write', 'writing', 'dictation', 'लिखना', 'श्रुतलेख'], ['writing']),
  o('H2.03', 2, 'Hindi', 'Retells a story in own words', 'कहानी को अपने शब्दों में सुनाता है', ['Story retelling'], ['story', 'retell', 'कहानी', 'सुनाना'], ['story', 'speaking']),
  o('H3.01', 3, 'Hindi', 'Reads age-appropriate stories and poems fluently', 'उम्र के अनुसार कहानियाँ और कविताएँ धाराप्रवाह पढ़ता है', ['Reading fluency', 'Poems'], ['read', 'fluency', 'poem', 'story', 'पढ़ना', 'कविता'], ['reading', 'story']),
  o('H3.02', 3, 'Hindi', 'Uses naming words, action words and describing words', 'संज्ञा, क्रिया और विशेषण शब्दों का प्रयोग करता है', ['Naming words', 'Action words', 'Describing words'], ['noun', 'verb', 'adjective', 'संज्ञा', 'क्रिया', 'विशेषण'], ['vocabulary', 'writing']),
  o('H4.01', 4, 'Hindi', 'Writes short paragraphs and letters on familiar topics', 'परिचित विषयों पर छोटे अनुच्छेद और पत्र लिखता है', ['Paragraph writing', 'Letter writing'], ['paragraph', 'letter', 'essay', 'अनुच्छेद', 'पत्र'], ['writing']),
  o('H5.01', 5, 'Hindi', 'Reads texts, finds main ideas and gives opinions', 'पाठ पढ़कर मुख्य बात ढूँढता और अपनी राय देता है', ['Comprehension', 'Main idea'], ['comprehension', 'main idea', 'opinion', 'पाठ', 'राय'], ['reading', 'speaking']),

  // ─── English ──────────────────────────────────────────────────
  o('EN1.01', 1, 'English', 'Uses greetings and simple phrases in English', 'अंग्रेज़ी में अभिवादन और सरल वाक्यांश बोलता है', ['Greetings', 'Hello and thank you'], ['greeting', 'greetings', 'hello', 'thank', 'नमस्ते'], ['speaking', 'vocabulary']),
  o('EN1.02', 1, 'English', 'Recognises letters of the English alphabet and their sounds', 'अंग्रेज़ी वर्णमाला के अक्षर और उनकी ध्वनि पहचानता है', ['Alphabet', 'Letter sounds'], ['alphabet', 'letter', 'abc', 'phonics', 'sound'], ['phonics']),
  o('EN1.03', 1, 'English', 'Names familiar objects, colours and body parts', 'परिचित चीज़ों, रंगों और शरीर के अंगों के नाम बताता है', ['Colours', 'Body Parts', 'Things around me'], ['colour', 'colours', 'body', 'part', 'object', 'रंग', 'शरीर'], ['vocabulary', 'body']),
  o('EN2.01', 2, 'English', 'Reads simple three-letter words and short sentences', 'तीन अक्षरों वाले सरल शब्द और छोटे वाक्य पढ़ता है', ['CVC words', 'Short sentences'], ['cvc', 'word', 'read', 'sentence', 'reading'], ['reading', 'phonics']),
  o('EN3.01', 3, 'English', 'Answers questions about a story read aloud', 'पढ़कर सुनाई गई कहानी पर प्रश्नों के उत्तर देता है', ['Story time', 'Comprehension'], ['story', 'question', 'answer', 'comprehension'], ['story', 'speaking']),
  o('EN4.01', 4, 'English', 'Writes short sentences about self and surroundings', 'अपने और आसपास के बारे में छोटे वाक्य लिखता है', ['Sentence writing', 'About me'], ['write', 'sentence', 'myself', 'writing'], ['writing', 'vocabulary']),
  o('EN5.01', 5, 'English', 'Reads short texts and uses new words in own sentences', 'छोटे पाठ पढ़ता है और नए शब्दों का अपने वाक्यों में प्रयोग करता है', ['Reading', 'New words'], ['read', 'vocabulary', 'new words', 'text'], ['reading', 'vocabulary']),

  // ─── EVS ──────────────────────────────────────────────────────
  o('EV1.01', 1, 'EVS', 'Names family members and describes their roles at home', 'परिवार के सदस्यों के नाम और घर में उनकी भूमिका बताता है', ['My Family', 'People at home'], ['family', 'mother', 'father', 'परिवार', 'माँ', 'पिता', 'home'], ['family', 'speaking']),
  o('EV1.02', 1, 'EVS', 'Names common domestic and wild animals and where they live', 'पालतू और जंगली जानवरों के नाम और वे कहाँ रहते हैं बताता है', ['Animals Around Us', 'Pet and wild animals'], ['animal', 'animals', 'pet', 'wild', 'domestic', 'जानवर', 'पशु'], ['animals', 'classification']),
  o('EV1.03', 1, 'EVS', 'Identifies body parts and describes keeping clean', 'शरीर के अंग पहचानता है और साफ़-सफ़ाई के बारे में बताता है', ['My Body', 'Keeping clean'], ['body', 'parts', 'clean', 'hygiene', 'wash', 'शरीर', 'अंग', 'सफ़ाई'], ['body', 'health']),
  o('EV2.01', 2, 'EVS', 'Observes plants and trees and names their parts', 'पौधों और पेड़ों को देखकर उनके भाग बताता है', ['Plants and Trees', 'Parts of a plant'], ['plant', 'plants', 'tree', 'leaf', 'root', 'पौधा', 'पेड़', 'पत्ता', 'जड़'], ['plants', 'observation']),
  o('EV2.02', 2, 'EVS', 'Tells where water comes from and why we should save it', 'पानी कहाँ से आता है और उसे क्यों बचाना चाहिए बताता है', ['Water', 'Saving water'], ['water', 'rain', 'river', 'well', 'पानी', 'बारिश', 'नदी', 'कुआँ'], ['water', 'observation']),
  o('EV3.01', 3, 'EVS', 'Groups food by source and describes a healthy meal', 'भोजन को उसके स्रोत के अनुसार बाँटता है और पौष्टिक भोजन बताता है', ['Food We Eat', 'Healthy food'], ['food', 'eat', 'healthy', 'meal', 'भोजन', 'खाना', 'फल', 'सब्ज़ी'], ['food', 'classification']),
  o('EV3.02', 3, 'EVS', 'Describes different kinds of houses and why they differ', 'अलग-अलग तरह के घरों और उनके अंतर के कारण बताता है', ['Houses', 'Shelter'], ['house', 'houses', 'shelter', 'home', 'घर', 'मकान'], ['shelter', 'observation']),
  o('EV3.03', 3, 'EVS', 'Identifies means of transport and communication', 'यातायात और संचार के साधन पहचानता है', ['Transport', 'Travel'], ['transport', 'travel', 'bus', 'train', 'cycle', 'यातायात', 'बस', 'रेल'], ['travel', 'classification']),
  o('EV4.01', 4, 'EVS', 'Explains how animals and plants depend on each other', 'पौधे और जानवर एक-दूसरे पर कैसे निर्भर हैं समझाता है', ['Animals and plants', 'Food chain'], ['depend', 'food chain', 'animals', 'plants', 'निर्भर'], ['animals', 'plants', 'observation']),
  o('EV4.02', 4, 'EVS', 'Describes local festivals, crafts and occupations', 'स्थानीय त्योहार, हस्तशिल्प और व्यवसायों का वर्णन करता है', ['Festivals', 'Work people do'], ['festival', 'craft', 'occupation', 'work', 'त्योहार', 'काम'], ['family', 'speaking']),
  o('EV5.01', 5, 'EVS', 'Explains sources of water, its uses and ways to keep it clean', 'पानी के स्रोत, उपयोग और उसे साफ़ रखने के तरीके समझाता है', ['Water', 'Clean water'], ['water', 'source', 'clean', 'पानी', 'स्रोत'], ['water', 'health']),
  o('EV5.02', 5, 'EVS', 'Records observations of seeds, germination and plant growth', 'बीज, अंकुरण और पौधों की वृद्धि के अवलोकन दर्ज करता है', ['Seeds', 'Germination'], ['seed', 'germination', 'grow', 'बीज', 'अंकुरण'], ['plants', 'data']),
];

export function outcomesFor(subject: Subject, grade?: number): Outcome[] {
  return OUTCOMES.filter((x) => x.subject === subject && (grade === undefined || x.grade === grade));
}

export function outcomeByCode(code: string): Outcome | undefined {
  return OUTCOMES.find((x) => x.code === code);
}

/** Suggested topics for the class and subject, for quick picks in the lesson studio. */
export function topicSuggestions(subject: Subject, grade: number): string[] {
  const own = outcomesFor(subject, grade).flatMap((x) => x.topics);
  const near = outcomesFor(subject).filter((x) => Math.abs(x.grade - grade) === 1).flatMap((x) => x.topics);
  return [...new Set([...own, ...near])].slice(0, 8);
}
