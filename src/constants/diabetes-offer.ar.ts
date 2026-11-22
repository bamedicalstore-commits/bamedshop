/**
 * Version arabe de l'offre diabète (page /ar).
 *
 * Traduction fidèle de diabetes-offer.ts : mêmes produits, mêmes quantités,
 * aucune promesse en plus. Arabe standard simple, lisible partout en Tunisie.
 * Les noms de marque et références restent en caractères latins (ils sont
 * imprimés ainsi sur les boîtes). Aucun prix.
 */
import type { FaqEntry } from "@/lib/site";

export interface ArOfferLine {
  productSlug: string;
  label: string;
  quantity: number;
}

export interface ArDiabetesOffer {
  id: "demarrage" | "abonnement-insuline";
  name: string;
  tagline: string;
  lines: ArOfferLine[];
  highlights: string[];
  whatsappMessage: string;
}

export const AR_DIABETES_OFFERS: ArDiabetesOffer[] = [
  {
    id: "demarrage",
    name: "باقة البداية للسكري",
    tagline: "كل ما تحتاجه لبدء المراقبة الذاتية لنسبة السكر في الدم",
    lines: [
      {
        productSlug: "bionime-gm550-03f",
        label: "علبة Bionime GM550: جهاز قياس + علبتان من 50 شريطاً",
        quantity: 1,
      },
      {
        productSlug: "sterilance-soft-100",
        label: "واخزات Sterilance Soft، علبة من 100",
        quantity: 1,
      },
    ],
    highlights: [
      "جهاز وأشرطة متوافقة (Bionime GM550 / GS550)",
      "100 قياس جاهز للاستعمال",
      "شرح طريقة الاستعمال بالهاتف عند التوصيل",
    ],
    whatsappMessage: "مرحباً BA Medical Store، أريد طلب باقة البداية للسكري.",
  },
  {
    id: "abonnement-insuline",
    name: "اشتراك السكري بالأنسولين",
    tagline: "مستلزماتك تصلك كل 3 أشهر دون أن تفكر فيها",
    lines: [
      {
        productSlug: "bionime-gs550-05f",
        label: "أشرطة Bionime GS550، علبة من 50",
        quantity: 6,
      },
      {
        productSlug: "sterilance-soft-100",
        label: "واخزات Sterilance Soft، علبة من 100",
        quantity: 3,
      },
      {
        productSlug: "clickfine-32gx4mm",
        label: "إبر قلم الأنسولين Clickfine ‏32G × 4 مم",
        quantity: 3,
      },
    ],
    highlights: [
      "توصيلة واحدة كل ثلاثة أشهر",
      "تذكير على واتساب قبل كل إرسال لتعديل الكميات",
      "دون التزام: يمكنك التوقف متى شئت",
    ],
    whatsappMessage: "مرحباً BA Medical Store، أريد الاشتراك في اشتراك السكري بالأنسولين.",
  },
];

export const AR_DIABETES_STEPS = [
  {
    title: "تحجز",
    text: "اختر باقتك وأرسل لنا رسالة على واتساب. لا يوجد أي دفع عبر الإنترنت.",
  },
  {
    title: "نتصل بك",
    text: "نؤكد معك المنتجات والكميات والسعر وعنوان التوصيل.",
  },
  {
    title: "تستلم وتدفع عند التوصيل",
    text: "توصيل إلى كامل تراب الجمهورية. بالنسبة للاشتراك، نتصل بك قبل كل إرسال.",
  },
];

export const AR_DIABETES_FAQ: FaqEntry[] = [
  {
    question: "ما هي الأشرطة المناسبة لجهاز Bionime GM550؟",
    answer:
      "يعمل جهاز Bionime Rightest GM550 مع أشرطة Bionime GS550 فقط. أشرطة العلامات الأخرى غير متوافقة معه.",
  },
  {
    question: "كم شريطاً أحتاج في الشهر؟",
    answer:
      "يعتمد ذلك على عدد القياسات التي يحددها طبيبك. على سبيل المثال، 3 قياسات في اليوم تعني حوالي 90 شريطاً و90 واخزة في الشهر. اتبع دائماً ما يحدده طبيبك.",
  },
  {
    question: "كيف يعمل الاشتراك كل ثلاثة أشهر؟",
    answer:
      "تستلم مستلزمات 3 أشهر في توصيلة واحدة. قبل كل إرسال نتصل بك لتأكيد الكميات أو تعديلها. يمكنك التوقف في أي وقت.",
  },
  {
    question: "كيف يتم الدفع؟",
    answer: "الدفع عند الاستلام. نؤكد كل طلب بمكالمة هاتفية قبل الإرسال.",
  },
  {
    question: "هل المنتجات أصلية؟",
    answer:
      "منتجات Bionime وSterilance وClickfine مصدرها قناة التوزيع الرسمية في تونس. تحقق من تاريخ انتهاء الصلاحية المكتوب على كل علبة عند الاستلام.",
  },
];
