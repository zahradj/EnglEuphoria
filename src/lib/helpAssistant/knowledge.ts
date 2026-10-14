/**
 * Knowledge base for the student Help Assistant.
 *
 * EVERY policy statement here comes from the app itself, so the assistant never invents rules:
 *  - 5-day (120 h) rule, credit return, teacher cancellations, technical failures, non-refundable packs
 *      -> src/pages/legal/RefundPolicyPage.tsx, src/hooks/useCancelReschedule.ts
 *  - free first lesson (cancel / reschedule any time) -> LessonManagementModal.tsx, bookingValidationService.ts
 *  - lesson = 25 minutes in a 30-minute slot = 1 credit; two back to back = 2 credits; weekly repeat
 *      -> src/lib/booking/lessonSlots.ts, BookMyClassModal.tsx
 *  - paying (online or by contacting support) -> src/config/payments.ts
 * If a rule changes in the app, change it here too (helpAssistant.test.ts keeps the five languages complete).
 */

export const HELP_LANGS = ['en', 'fr', 'es', 'ar', 'tr'] as const;
export type HelpLang = (typeof HELP_LANGS)[number];
export type L10n = Record<HelpLang, string>;

export type HelpActionId =
  | 'book'
  | 'lessons'
  | 'billing'
  | 'homework'
  | 'games'
  | 'path'
  | 'profile'
  | 'refund'
  | 'open-space'
  | 'email-support'
  | 'email-billing';

export const SUPPORT_EMAIL = 'support@engleuphoria.com';
export const BILLING_EMAIL = 'billing@engleuphoria.com';

export const ACTION_LABELS: Record<HelpActionId, L10n> = {
  book: { en: 'Book a lesson', fr: 'Réserver un cours', es: 'Reservar una clase', ar: 'احجز درسًا', tr: 'Ders ayırt' },
  lessons: { en: 'Open My Lessons', fr: 'Ouvrir Mes leçons', es: 'Abrir Mis clases', ar: 'افتح دروسي', tr: 'Derslerim’i aç' },
  billing: { en: 'Buy lessons', fr: 'Acheter des leçons', es: 'Comprar clases', ar: 'اشترِ دروسًا', tr: 'Ders satın al' },
  homework: { en: 'Open Homework', fr: 'Ouvrir les devoirs', es: 'Abrir Tareas', ar: 'افتح الواجبات', tr: 'Ödevleri aç' },
  games: { en: 'Open Games', fr: 'Ouvrir les jeux', es: 'Abrir Juegos', ar: 'افتح الألعاب', tr: 'Oyunları aç' },
  path: { en: 'Open My Learning Path', fr: 'Ouvrir mon parcours', es: 'Abrir Mi ruta', ar: 'افتح مساري', tr: 'Öğrenme yolumu aç' },
  profile: { en: 'Open My Profile', fr: 'Ouvrir mon profil', es: 'Abrir Mi perfil', ar: 'افتح ملفي', tr: 'Profilimi aç' },
  refund: { en: 'Read the full policy', fr: 'Lire la politique complète', es: 'Leer la política completa', ar: 'اقرأ السياسة كاملة', tr: 'Tüm politikayı oku' },
  'open-space': { en: 'Open a child’s space', fr: 'Ouvrir l’espace d’un enfant', es: 'Abrir el espacio de un hijo', ar: 'افتح مساحة طفل', tr: 'Çocuğun alanını aç' },
  'email-support': { en: 'Email support', fr: 'Écrire au support', es: 'Escribir a soporte', ar: 'راسل الدعم', tr: 'Destek’e yaz' },
  'email-billing': { en: 'Email billing', fr: 'Écrire à la facturation', es: 'Escribir a facturación', ar: 'راسل الفوترة', tr: 'Faturalamaya yaz' },
};

export interface HelpTopic {
  id: string;
  /** Question shown on the suggestion chips. */
  q: L10n;
  /** Words / phrases a student might type. Matched on word starts, accents and case ignored. */
  keywords: Record<HelpLang, string[]>;
  /** Answer. `**bold**` and "\n" are supported; "• " starts a bullet. */
  a: L10n;
  actions?: HelpActionId[];
  /** Shown as a starter chip when the chat opens. */
  starter?: boolean;
}

export const HELP_TOPICS: HelpTopic[] = [
  // ───────────────────────────────────────────────────────────── REFUND (before cancel: wins ties)
  {
    id: 'refund',
    starter: true,
    q: {
      en: 'Can I get a refund?',
      fr: 'Puis-je être remboursé ?',
      es: '¿Puedo pedir un reembolso?',
      ar: 'هل يمكنني استرداد المبلغ؟',
      tr: 'İade alabilir miyim?',
    },
    keywords: {
      en: ['refund', 'money back', 'get my money', 'reimburse', 'chargeback', 'refund policy', 'return my credit', 'credit back'],
      fr: ['rembours', 'remboursement', 'rendre mon argent', 'récupérer mon argent', 'recuperer mon argent', 'retour de credit', 'credit rendu', 'litige', 'rétrofacturation'],
      es: ['reembolso', 'reembols', 'devuelv', 'devolv', 'dinero', 'devolucion', 'devolver mi dinero', 'recuperar mi dinero', 'devuelven el credito', 'contracargo'],
      ar: ['استرداد', 'استرجاع', 'ارجاع المبلغ', 'استرجاع المال', 'رد المبلغ', 'تعويض'],
      tr: ['iade', 'para iadesi', 'parami geri', 'geri odeme', 'kredi iadesi', 'geri almak'],
    },
    a: {
      en:
        'Here is how refunds work:\n• **Cancel at least 5 days (120 hours) before the lesson** → your lesson credit is returned to your balance.\n• **Cancel less than 5 days before, or miss the lesson** → the credit is not returned.\n• **The teacher cancels** → your credit is fully returned and you get priority rebooking.\n• **A verified technical failure on our side** → the credit is returned. Problems with your own device or internet do not qualify.\n• **Credit packs are non-refundable** once bought. Unused credits stay valid for the period shown at checkout.\nFor a payment question, write to ' + BILLING_EMAIL + '.',
      fr:
        'Voici comment fonctionnent les remboursements :\n• **Annulation au moins 5 jours (120 heures) avant le cours** → le crédit de la leçon est remis sur votre solde.\n• **Annulation moins de 5 jours avant, ou cours manqué** → le crédit n’est pas rendu.\n• **Le professeur annule** → votre crédit est entièrement rendu et vous êtes prioritaire pour reprogrammer.\n• **Panne technique vérifiée de notre côté** → le crédit est rendu. Un problème d’appareil ou de connexion de votre côté n’est pas concerné.\n• **Les packs de leçons ne sont pas remboursables** une fois achetés. Les crédits non utilisés restent valables pendant la durée indiquée à l’achat.\nPour une question de paiement, écrivez à ' + BILLING_EMAIL + '.',
      es:
        'Así funcionan los reembolsos:\n• **Cancelas al menos 5 días (120 horas) antes de la clase** → el crédito vuelve a tu saldo.\n• **Cancelas con menos de 5 días, o no asistes** → el crédito no se devuelve.\n• **El profesor cancela** → se te devuelve el crédito completo y tienes prioridad para reprogramar.\n• **Fallo técnico verificado por nuestra parte** → se devuelve el crédito. Los problemas de tu dispositivo o de tu internet no cuentan.\n• **Los paquetes de clases no son reembolsables** una vez comprados. Los créditos sin usar siguen válidos durante el plazo indicado al pagar.\nPara una duda de pago, escribe a ' + BILLING_EMAIL + '.',
      ar:
        'هكذا تعمل عمليات الاسترداد:\n• **الإلغاء قبل 5 أيام (120 ساعة) على الأقل من الدرس** ← يعود رصيد الدرس إلى حسابك.\n• **الإلغاء قبل أقل من 5 أيام أو التغيّب عن الدرس** ← لا يُعاد الرصيد.\n• **إذا ألغى المعلّم الدرس** ← يُعاد رصيدك كاملًا وتحصل على أولوية في إعادة الحجز.\n• **عطل تقني مؤكَّد من جانبنا** ← يُعاد الرصيد. أما مشاكل جهازك أو إنترنتك فلا تُحتسب.\n• **باقات الدروس غير قابلة للاسترداد** بعد الشراء. تبقى الأرصدة غير المستخدمة صالحة للمدة المذكورة عند الدفع.\nلأي سؤال عن الدفع راسل ' + BILLING_EMAIL + '.',
      tr:
        'İadeler şöyle işler:\n• **Dersten en az 5 gün (120 saat) önce iptal** → ders krediniz bakiyenize geri döner.\n• **5 günden az kala iptal ya da derse gelmeme** → kredi iade edilmez.\n• **Öğretmen iptal ederse** → krediniz tamamen iade edilir ve yeniden rezervasyonda öncelik alırsınız.\n• **Bizim tarafımızda doğrulanmış teknik arıza** → kredi iade edilir. Kendi cihazınızdan veya internetinizden kaynaklanan sorunlar kapsam dışıdır.\n• **Ders paketleri satın alındıktan sonra iade edilmez.** Kullanılmayan krediler ödeme sırasında belirtilen süre boyunca geçerlidir.\nÖdeme soruları için ' + BILLING_EMAIL + ' adresine yazın.',
    },
    actions: ['refund', 'email-billing'],
  },

  // ───────────────────────────────────────────────────────────── CANCEL
  {
    id: 'cancel',
    starter: true,
    q: {
      en: 'How do I cancel a lesson?',
      fr: 'Comment annuler un cours ?',
      es: '¿Cómo cancelo una clase?',
      ar: 'كيف ألغي درسًا؟',
      tr: 'Bir dersi nasıl iptal ederim?',
    },
    keywords: {
      en: ['cancel', 'cancellation', 'cancel lesson', 'cancel class', 'cancel booking', 'delete booking', 'remove my lesson', 'unbook'],
      fr: ['annul', 'annuler', 'annulation', 'supprimer ma reservation', 'supprimer mon cours'],
      es: ['cancel', 'cancelar', 'cancelacion', 'anular', 'eliminar mi reserva'],
      ar: ['الغاء', 'الغي', 'الغاء الدرس', 'الغاء الحجز'],
      tr: ['iptal', 'iptal et', 'iptal etmek', 'rezervasyonu sil'],
    },
    a: {
      en:
        'To cancel a lesson: on your dashboard, find the **Upcoming Lesson** card and press **Cancel**.\n• **At least 5 days (120 hours) before** → your credit goes back to your balance.\n• **Less than 5 days before** → the app does not allow it and the credit is not returned (the teacher has reserved the time for you).\n• **Your free first lesson** → you can cancel any time with no charge, and book a new one.\n• If **the teacher** cancels, your credit is fully returned.\nIf something exceptional happened, write to ' + SUPPORT_EMAIL + '.',
      fr:
        'Pour annuler un cours : sur votre tableau de bord, repérez la carte **Upcoming Lesson** (cours à venir) et appuyez sur **Cancel**.\n• **Au moins 5 jours (120 heures) avant** → votre crédit est remis sur votre solde.\n• **Moins de 5 jours avant** → l’application ne le permet pas et le crédit n’est pas rendu (le professeur a bloqué ce temps pour vous).\n• **Votre premier cours gratuit** → vous pouvez l’annuler à tout moment sans frais, puis en réserver un nouveau.\n• Si **le professeur** annule, votre crédit est entièrement rendu.\nEn cas de situation exceptionnelle, écrivez à ' + SUPPORT_EMAIL + '.',
      es:
        'Para cancelar una clase: en tu panel busca la tarjeta **Upcoming Lesson** (próxima clase) y pulsa **Cancel**.\n• **Al menos 5 días (120 horas) antes** → tu crédito vuelve a tu saldo.\n• **Menos de 5 días antes** → la app no lo permite y el crédito no se devuelve (el profesor ha reservado ese tiempo para ti).\n• **Tu primera clase gratis** → puedes cancelarla en cualquier momento sin cargo y reservar otra.\n• Si **el profesor** cancela, se te devuelve el crédito completo.\nSi ocurrió algo excepcional, escribe a ' + SUPPORT_EMAIL + '.',
      ar:
        'لإلغاء درس: في لوحتك ابحث عن بطاقة **Upcoming Lesson** (الدرس القادم) واضغط **Cancel**.\n• **قبل 5 أيام (120 ساعة) على الأقل** ← يعود رصيدك إلى حسابك.\n• **قبل أقل من 5 أيام** ← لا يسمح التطبيق بذلك ولا يُعاد الرصيد (فالمعلّم حجز هذا الوقت لك).\n• **درسك الأول المجاني** ← يمكنك إلغاؤه في أي وقت دون أي رسوم ثم حجز درس جديد.\n• إذا ألغى **المعلّم** الدرس فيُعاد رصيدك كاملًا.\nوإن حدث أمر استثنائي راسل ' + SUPPORT_EMAIL + '.',
      tr:
        'Bir dersi iptal etmek için: panonuzda **Upcoming Lesson** (yaklaşan ders) kartını bulup **Cancel**’a basın.\n• **En az 5 gün (120 saat) önce** → krediniz bakiyenize geri döner.\n• **5 günden az kala** → uygulama buna izin vermez ve kredi iade edilmez (öğretmen bu zamanı sizin için ayırdı).\n• **Ücretsiz ilk dersiniz** → istediğiniz zaman ücretsiz iptal edip yenisini ayırtabilirsiniz.\n• **Öğretmen** iptal ederse krediniz tamamen iade edilir.\nOlağanüstü bir durum olduysa ' + SUPPORT_EMAIL + ' adresine yazın.',
    },
    actions: ['lessons', 'refund'],
  },

  // ───────────────────────────────────────────────────────────── RESCHEDULE
  {
    id: 'reschedule',
    starter: true,
    q: {
      en: 'How do I reschedule a lesson?',
      fr: 'Comment reprogrammer un cours ?',
      es: '¿Cómo cambio la hora de una clase?',
      ar: 'كيف أغيّر موعد درس؟',
      tr: 'Bir dersin saatini nasıl değiştiririm?',
    },
    keywords: {
      en: ['reschedule', 'rescheduling', 'change time', 'change the time', 'change date', 'move lesson', 'move my lesson', 'another time', 'different time', 'postpone', 'change my lesson'],
      fr: ['reprogramm', 'reprogrammer', 'chang l heure', 'chang la date', 'chang l horaire', 'chang mon cours', 'deplacer', 'decaler', 'reporter', 'autre horaire', 'autre heure', 'modifier mon cours'],
      es: ['reprogram', 'reprogramar', 'cambi la hora', 'cambi el horario', 'cambi la fecha', 'cambi de hora', 'cambi mi clase', 'mover la clase', 'aplazar', 'otra hora'],
      ar: ['اعادة جدولة', 'اغير موعد', 'اغير الموعد', 'غير موعد', 'غير الموعد', 'تغيير موعد', 'تغيير الموعد', 'تغيير وقت', 'تغيير الوقت', 'تغيير التاريخ', 'تاجيل', 'نقل الدرس', 'موعد اخر', 'تعديل الموعد'],
      tr: ['yeniden planla', 'saati degistir', 'saat degistir', 'tarihi degistir', 'ertele', 'baska saat', 'baska zaman', 'dersi tasi', 'degistirmek'],
    },
    a: {
      en:
        'To reschedule: on the **Upcoming Lesson** card press **Reschedule**, pick a new time among your teacher’s open slots, then confirm.\n• **Paid lesson** → possible **at least 5 days (120 hours)** before the start.\n• **Free first lesson** → possible at any time, no charge.\n• Inside the 5 days the app does not allow changes. If something exceptional happened, write to ' + SUPPORT_EMAIL + '.\nYou can only move to a time your teacher has opened. To change teacher, book a new lesson with another teacher.',
      fr:
        'Pour reprogrammer : sur la carte **Upcoming Lesson**, appuyez sur **Reschedule**, choisissez un nouvel horaire parmi les créneaux ouverts de votre professeur, puis confirmez.\n• **Cours payant** → possible **au moins 5 jours (120 heures)** avant le début.\n• **Premier cours gratuit** → possible à tout moment, sans frais.\n• Dans les 5 jours, l’application ne permet plus de changement. En cas de situation exceptionnelle, écrivez à ' + SUPPORT_EMAIL + '.\nOn ne peut aller que sur un horaire ouvert par le professeur. Pour changer de professeur, réservez un nouveau cours avec un autre.',
      es:
        'Para cambiar la hora: en la tarjeta **Upcoming Lesson** pulsa **Reschedule**, elige una nueva hora entre los huecos abiertos de tu profesor y confirma.\n• **Clase de pago** → posible **al menos 5 días (120 horas)** antes del inicio.\n• **Primera clase gratis** → posible en cualquier momento, sin cargo.\n• Dentro de los 5 días la app no permite cambios. Si ocurrió algo excepcional, escribe a ' + SUPPORT_EMAIL + '.\nSolo puedes pasar a una hora que el profesor haya abierto. Para cambiar de profesor, reserva una clase nueva con otro.',
      ar:
        'لتغيير الموعد: في بطاقة **Upcoming Lesson** اضغط **Reschedule**، اختر وقتًا جديدًا من المواعيد المتاحة لدى معلّمك ثم أكّد.\n• **الدرس المدفوع** ← ممكن قبل **5 أيام (120 ساعة) على الأقل** من البداية.\n• **الدرس الأول المجاني** ← ممكن في أي وقت دون رسوم.\n• خلال الأيام الخمسة الأخيرة لا يسمح التطبيق بالتغيير. وإن حدث أمر استثنائي راسل ' + SUPPORT_EMAIL + '.\nيمكنك فقط الانتقال إلى وقت فتحه المعلّم. ولتغيير المعلّم احجز درسًا جديدًا مع معلّم آخر.',
      tr:
        'Saati değiştirmek için: **Upcoming Lesson** kartında **Reschedule**’a basın, öğretmeninizin açık saatlerinden yeni birini seçin ve onaylayın.\n• **Ücretli ders** → başlangıçtan **en az 5 gün (120 saat) önce** mümkün.\n• **Ücretsiz ilk ders** → her zaman, ücretsiz mümkün.\n• Son 5 günde uygulama değişikliğe izin vermez. Olağanüstü bir durum olduysa ' + SUPPORT_EMAIL + ' adresine yazın.\nYalnızca öğretmenin açtığı bir saate geçebilirsiniz. Öğretmen değiştirmek için başka bir öğretmenle yeni ders ayırtın.',
    },
    actions: ['lessons'],
  },

  // ───────────────────────────────────────────────────────────── BOOK
  {
    id: 'book',
    starter: true,
    q: {
      en: 'How do I book a lesson?',
      fr: 'Comment réserver un cours ?',
      es: '¿Cómo reservo una clase?',
      ar: 'كيف أحجز درسًا؟',
      tr: 'Nasıl ders ayırtırım?',
    },
    keywords: {
      en: ['book', 'booking', 'reserve', 'schedule a lesson', 'new lesson', 'find teacher', 'find a teacher', 'choose teacher', 'choose a teacher', 'book session', 'sign up for a lesson', 'how to start'],
      fr: ['reserv', 'reserver', 'reservation', 'prendre un cours', 'prendre rendez-vous', 'nouveau cours', 'trouver un professeur', 'choisir un professeur', 'choisir un prof'],
      es: ['reserv', 'reservar', 'reserva', 'agendar', 'apuntarme', 'nueva clase', 'buscar profesor', 'elegir profesor', 'encontrar profesor'],
      ar: ['حجز', 'احجز', 'كيف احجز', 'اريد حجز', 'درس جديد', 'ابحث عن معلم', 'اختيار معلم', 'اختار معلم'],
      tr: ['ders ayirt', 'rezervasyon', 'ders al', 'randevu', 'yeni ders', 'ogretmen bul', 'ogretmen sec', 'ayirtmak'],
    },
    a: {
      en:
        'To book a lesson:\n1. On your dashboard press **Book a Lesson** (it opens “Find Your Perfect Teacher”).\n2. Choose a teacher and press **Book Session**.\n3. Pick the lesson length, then the day, then the time.\n4. Press **Book Now** to confirm.\nYour lesson then shows at the top of your dashboard. You need at least 1 credit, or your free first lesson.',
      fr:
        'Pour réserver un cours :\n1. Sur votre tableau de bord, appuyez sur **Book a Lesson** (cela ouvre « Find Your Perfect Teacher »).\n2. Choisissez un professeur et appuyez sur **Book Session**.\n3. Choisissez la durée, puis le jour, puis l’heure.\n4. Appuyez sur **Book Now** pour confirmer.\nLe cours apparaît ensuite en haut de votre tableau de bord. Il faut au moins 1 crédit, ou votre premier cours gratuit.',
      es:
        'Para reservar una clase:\n1. En tu panel pulsa **Book a Lesson** (abre “Find Your Perfect Teacher”).\n2. Elige un profesor y pulsa **Book Session**.\n3. Elige la duración, luego el día y después la hora.\n4. Pulsa **Book Now** para confirmar.\nLa clase aparecerá arriba en tu panel. Necesitas al menos 1 crédito, o tu primera clase gratis.',
      ar:
        'لحجز درس:\n1. في لوحتك اضغط **Book a Lesson** (تفتح صفحة “Find Your Perfect Teacher”).\n2. اختر معلّمًا واضغط **Book Session**.\n3. اختر مدة الدرس ثم اليوم ثم الوقت.\n4. اضغط **Book Now** للتأكيد.\nسيظهر الدرس بعدها أعلى لوحتك. تحتاج إلى رصيد واحد على الأقل أو إلى درسك الأول المجاني.',
      tr:
        'Ders ayırtmak için:\n1. Panonuzda **Book a Lesson**’a basın (“Find Your Perfect Teacher” açılır).\n2. Bir öğretmen seçip **Book Session**’a basın.\n3. Ders süresini, sonra günü, sonra saati seçin.\n4. Onaylamak için **Book Now**’a basın.\nDers daha sonra panonuzun en üstünde görünür. En az 1 krediye veya ücretsiz ilk dersinize ihtiyacınız var.',
    },
    actions: ['book'],
  },

  // ───────────────────────────────────────────────────────────── FREE TRIAL
  {
    id: 'trial',
    q: {
      en: 'Is the first lesson free?',
      fr: 'Le premier cours est-il gratuit ?',
      es: '¿La primera clase es gratis?',
      ar: 'هل الدرس الأول مجاني؟',
      tr: 'İlk ders ücretsiz mi?',
    },
    keywords: {
      en: ['free', 'trial', 'free trial', 'first lesson', 'first class', 'free lesson', 'free class', 'test lesson', 'demo lesson'],
      fr: ['gratuit', 'essai', 'cours d essai', 'premier cours', 'premiere lecon', 'lecon gratuite', 'cours gratuit', 'offert'],
      es: ['gratis', 'gratuita', 'gratuito', 'prueba', 'clase de prueba', 'primera clase', 'primera leccion', 'clase gratis'],
      ar: ['مجاني', 'مجانا', 'تجربه', 'درس تجريبي', 'الدرس الاول', 'اول درس', 'حصه تجريبيه'],
      tr: ['ucretsiz', 'bedava', 'deneme', 'deneme dersi', 'ilk ders', 'ucretsiz ders'],
    },
    a: {
      en:
        'Yes — your **first lesson is free**. It is a single 25-minute lesson and uses no credit.\n• You can cancel or reschedule it at any time, with no charge.\n• The “book every week” option is not available for the free lesson.\n• After it, each lesson uses credits.',
      fr:
        'Oui — votre **premier cours est gratuit**. C’est une seule leçon de 25 minutes qui n’utilise aucun crédit.\n• Vous pouvez l’annuler ou le reprogrammer à tout moment, sans frais.\n• L’option « réserver chaque semaine » n’est pas disponible pour le cours gratuit.\n• Ensuite, chaque leçon utilise des crédits.',
      es:
        'Sí: tu **primera clase es gratis**. Es una sola clase de 25 minutos y no usa créditos.\n• Puedes cancelarla o cambiarla en cualquier momento, sin cargo.\n• La opción “reservar cada semana” no está disponible para la clase gratis.\n• Después, cada clase usa créditos.',
      ar:
        'نعم، **درسك الأول مجاني**. هو درس واحد مدته 25 دقيقة ولا يستهلك أي رصيد.\n• يمكنك إلغاؤه أو تغيير موعده في أي وقت دون رسوم.\n• خيار «احجز كل أسبوع» غير متاح للدرس المجاني.\n• بعده يستهلك كل درس رصيدًا.',
      tr:
        'Evet, **ilk dersiniz ücretsiz**. 25 dakikalık tek bir derstir ve kredi harcamaz.\n• İstediğiniz zaman ücretsiz iptal edebilir veya saatini değiştirebilirsiniz.\n• “Her hafta ayırt” seçeneği ücretsiz ders için kullanılamaz.\n• Sonrasında her ders kredi harcar.',
    },
    actions: ['book'],
  },

  // ───────────────────────────────────────────────────────────── LESSON LENGTH
  {
    id: 'length',
    q: {
      en: 'How long is a lesson?',
      fr: 'Combien de temps dure un cours ?',
      es: '¿Cuánto dura una clase?',
      ar: 'كم مدة الدرس؟',
      tr: 'Bir ders ne kadar sürer?',
    },
    keywords: {
      en: ['how long', 'duration', 'length', 'minutes', 'back to back', 'every week', 'weekly', 'repeat', 'recurring', 'one hour', 'two lessons'],
      fr: ['combien de temps', 'duree', 'dure', 'minutes', 'enchaine', 'a la suite', 'chaque semaine', 'hebdomadaire', 'repeter', 'une heure', 'deux lecons'],
      es: ['cuanto dura', 'duracion', 'minutos', 'seguidas', 'cada semana', 'semanal', 'repetir', 'una hora', 'dos clases'],
      ar: ['كم مده', 'مده الدرس', 'مدة', 'دقيقه', 'دقائق', 'كل اسبوع', 'اسبوعيا', 'متتاليه', 'ساعه'],
      tr: ['ne kadar surer', 'sure', 'kac dakika', 'dakika', 'ust uste', 'her hafta', 'haftalik', 'tekrar', 'bir saat', 'iki ders'],
    },
    a: {
      en:
        'One lesson lasts **25 minutes** (it is booked in a 30-minute slot) and uses **1 credit**.\n• **“2 lessons back to back”** gives two lessons in a row and uses **2 credits**.\n• **“Book this slot every week”** repeats the same teacher, weekday and time, using 1 credit per week.',
      fr:
        'Un cours dure **25 minutes** (il est réservé dans un créneau de 30 minutes) et utilise **1 crédit**.\n• **« 2 lessons back to back »** donne deux leçons à la suite et utilise **2 crédits**.\n• **« Book this slot every week »** répète le même professeur, le même jour et la même heure, avec 1 crédit par semaine.',
      es:
        'Una clase dura **25 minutos** (se reserva en un hueco de 30 minutos) y usa **1 crédito**.\n• **“2 lessons back to back”** da dos clases seguidas y usa **2 créditos**.\n• **“Book this slot every week”** repite el mismo profesor, día y hora, con 1 crédito por semana.',
      ar:
        'مدة الدرس الواحد **25 دقيقة** (يُحجز ضمن فترة 30 دقيقة) ويستهلك **رصيدًا واحدًا**.\n• خيار **“2 lessons back to back”** يعطيك درسين متتاليين ويستهلك **رصيدين**.\n• خيار **“Book this slot every week”** يكرّر نفس المعلّم واليوم والوقت بمعدل رصيد واحد في الأسبوع.',
      tr:
        'Bir ders **25 dakikadır** (30 dakikalık bir aralıkta ayrılır) ve **1 kredi** harcar.\n• **“2 lessons back to back”** art arda iki ders verir ve **2 kredi** harcar.\n• **“Book this slot every week”** aynı öğretmeni, günü ve saati tekrarlar; haftada 1 kredi harcar.',
    },
    actions: ['book'],
  },

  // ───────────────────────────────────────────────────────────── CREDITS
  {
    id: 'credits',
    q: {
      en: 'What is a credit? How many do I have?',
      fr: 'C’est quoi un crédit ? Combien m’en reste-t-il ?',
      es: '¿Qué es un crédito? ¿Cuántos tengo?',
      ar: 'ما هو الرصيد؟ كم بقي لدي؟',
      tr: 'Kredi nedir? Kaç kredim var?',
    },
    keywords: {
      en: ['credit', 'credits', 'balance', 'lessons left', 'how many lessons', 'expire', 'expiry', 'expired', 'valid', 'validity', 'run out'],
      fr: ['credit', 'credits', 'solde', 'lecons restantes', 'combien de cours', 'expire', 'expiration', 'valable', 'validite', 'plus de credit'],
      es: ['credito', 'creditos', 'saldo', 'clases restantes', 'cuantas clases', 'caduc', 'expira', 'vigencia', 'valido', 'sin creditos'],
      ar: ['رصيد', 'ارصده', 'الرصيد', 'كم درس', 'دروس متبقيه', 'تنتهي', 'صلاحيه', 'انتهى رصيدي'],
      tr: ['kredi', 'bakiye', 'kalan ders', 'kac ders', 'sona er', 'gecerlilik', 'gecerli', 'krediler bitti'],
    },
    a: {
      en:
        'A **credit** pays for one lesson. Your balance is shown at the top of **My Lessons** (for example “4 lessons left · 25 minutes each”).\n• Credits stay valid for the period shown when you buy. Expired credits cannot be reinstated.\n• When you reach zero, buy more to book again.',
      fr:
        'Un **crédit** paie une leçon. Votre solde s’affiche en haut de **My Lessons** (par exemple « 4 lessons left · 25 minutes each »).\n• Les crédits restent valables pendant la durée indiquée à l’achat. Les crédits expirés ne peuvent pas être rétablis.\n• Quand il n’en reste plus, achetez-en pour réserver à nouveau.',
      es:
        'Un **crédito** paga una clase. Tu saldo aparece arriba en **My Lessons** (por ejemplo “4 lessons left · 25 minutes each”).\n• Los créditos siguen válidos durante el plazo indicado al comprar. Los créditos caducados no se pueden restablecer.\n• Cuando llegues a cero, compra más para volver a reservar.',
      ar:
        '**الرصيد** يدفع ثمن درس واحد. يظهر رصيدك أعلى صفحة **My Lessons** (مثل «4 lessons left · 25 minutes each»).\n• تبقى الأرصدة صالحة للمدة المذكورة عند الشراء. لا يمكن إعادة الأرصدة المنتهية.\n• عندما ينفد رصيدك اشترِ المزيد لتتمكن من الحجز من جديد.',
      tr:
        'Bir **kredi** bir dersin ücretini karşılar. Bakiyeniz **My Lessons** sayfasının üstünde görünür (örneğin “4 lessons left · 25 minutes each”).\n• Krediler satın alırken belirtilen süre boyunca geçerlidir. Süresi dolan krediler geri verilemez.\n• Sıfıra düştüğünde yeniden ders ayırtmak için kredi satın alın.',
    },
    actions: ['lessons', 'billing'],
  },

  // ───────────────────────────────────────────────────────────── BUY
  {
    id: 'buy',
    starter: true,
    q: {
      en: 'How do I buy lessons?',
      fr: 'Comment acheter des leçons ?',
      es: '¿Cómo compro clases?',
      ar: 'كيف أشتري دروسًا؟',
      tr: 'Nasıl ders satın alırım?',
    },
    keywords: {
      en: ['buy', 'purchase', 'pay', 'payment', 'pack', 'package', 'price', 'pricing', 'cost', 'how much', 'card', 'invoice', 'receipt', 'top up', 'bank transfer'],
      fr: ['achet', 'acheter', 'achat', 'payer', 'paiement', 'pack', 'forfait', 'prix', 'tarif', 'combien ca coute', 'cout', 'carte', 'facture', 'recu', 'virement', 'recharger'],
      es: ['compr', 'comprar', 'compra', 'pagar', 'pago', 'paquete', 'precio', 'tarifa', 'cuanto cuesta', 'costo', 'tarjeta', 'factura', 'recibo', 'transferencia', 'recargar'],
      ar: ['شراء', 'اشتري', 'دفع', 'ادفع', 'باقه', 'باقات', 'سعر', 'اسعار', 'بطاقه', 'فاتوره', 'حواله', 'تحويل بنكي', 'كم التكلفه'],
      tr: ['satin al', 'satin alma', 'odeme', 'odemek', 'paket', 'fiyat', 'ucret', 'ne kadar', 'kart', 'fatura', 'makbuz', 'havale', 'kredi yukle'],
    },
    a: {
      en:
        'To buy lessons: open **Buy Lessons** in the menu (or press **Buy more** on My Lessons) and choose a pack.\n• You can pay online by card, or write to ' + SUPPORT_EMAIL + ' to arrange the payment with the school.\n• Credits appear on your dashboard as soon as they are added.\n• Parents with a family account use the **Lessons** tab of the family dashboard: pick the child, then a pack.\nPrices are shown on the pack page.',
      fr:
        'Pour acheter des leçons : ouvrez **Buy Lessons** dans le menu (ou appuyez sur **Buy more** dans My Lessons) et choisissez un pack.\n• Vous pouvez payer en ligne par carte, ou écrire à ' + SUPPORT_EMAIL + ' pour régler directement avec l’école.\n• Les crédits apparaissent sur votre tableau de bord dès qu’ils sont ajoutés.\n• Les parents d’un compte famille utilisent l’onglet **Cours** du tableau de bord famille : on choisit l’enfant, puis un pack.\nLes prix sont affichés sur la page des packs.',
      es:
        'Para comprar clases: abre **Buy Lessons** en el menú (o pulsa **Buy more** en My Lessons) y elige un paquete.\n• Puedes pagar en línea con tarjeta, o escribir a ' + SUPPORT_EMAIL + ' para acordar el pago con la escuela.\n• Los créditos aparecen en tu panel en cuanto se añaden.\n• Los padres con cuenta familiar usan la pestaña **Clases** del panel familiar: eligen al hijo y luego un paquete.\nLos precios se muestran en la página de paquetes.',
      ar:
        'لشراء دروس: افتح **Buy Lessons** من القائمة (أو اضغط **Buy more** في My Lessons) واختر باقة.\n• يمكنك الدفع عبر الإنترنت بالبطاقة، أو مراسلة ' + SUPPORT_EMAIL + ' للاتفاق على الدفع مع المدرسة.\n• تظهر الأرصدة في لوحتك فور إضافتها.\n• يستخدم أولياء الأمور في حساب العائلة تبويب **الدروس** في لوحة العائلة: يختارون الطفل ثم الباقة.\nتظهر الأسعار في صفحة الباقات.',
      tr:
        'Ders satın almak için: menüden **Buy Lessons**’ı açın (veya My Lessons’ta **Buy more**’a basın) ve bir paket seçin.\n• Kartla çevrimiçi ödeyebilir ya da okulla ödemeyi ayarlamak için ' + SUPPORT_EMAIL + ' adresine yazabilirsiniz.\n• Krediler eklenir eklenmez panonuzda görünür.\n• Aile hesabındaki ebeveynler aile panosunun **Dersler** sekmesini kullanır: çocuğu, sonra bir paketi seçer.\nFiyatlar paket sayfasında gösterilir.',
    },
    actions: ['billing', 'email-support'],
  },

  // ───────────────────────────────────────────────────────────── JOIN
  {
    id: 'join',
    starter: true,
    q: {
      en: 'How do I join my lesson?',
      fr: 'Comment rejoindre mon cours ?',
      es: '¿Cómo entro a mi clase?',
      ar: 'كيف أدخل إلى درسي؟',
      tr: 'Derse nasıl katılırım?',
    },
    keywords: {
      en: ['join', 'enter class', 'enter the class', 'start lesson', 'classroom', 'where is my lesson', 'link', 'zoom', 'meeting link', 'how do i start my class', 'live class'],
      fr: ['rejoindre', 'entrer dans la classe', 'entrer en cours', 'commencer le cours', 'salle de classe', 'classe virtuelle', 'ou est mon cours', 'lien', 'lien du cours'],
      es: ['unirme', 'entr a la clase', 'entr a mi clase', 'entr en la clase', 'entr en mi clase', 'entrar a la clase', 'entrar en clase', 'empezar la clase', 'aula', 'donde esta mi clase', 'enlace', 'link de la clase'],
      ar: ['انضم', 'الانضمام', 'ادخل', 'ادخل الى', 'ادخل الى الدرس', 'دخول الدرس', 'الصف', 'غرفه الدرس', 'رابط', 'اين درسي', 'كيف ابدا الدرس'],
      tr: ['katil', 'derse gir', 'sinif', 'sinifa gir', 'derse basla', 'ders linki', 'link', 'dersim nerede'],
    },
    a: {
      en:
        'A few minutes before your lesson, the card at the top of your dashboard says **Starting Soon!** — press **Join Classroom**.\nBefore you join:\n• Sit somewhere quiet and, if you can, use headphones.\n• Allow the **microphone and camera** when your browser asks.\n• If the slides do not show, refresh the page (Ctrl+Shift+R).',
      fr:
        'Quelques minutes avant le cours, la carte en haut de votre tableau de bord affiche **Starting Soon!** — appuyez sur **Join Classroom**.\nAvant de rejoindre :\n• Installez-vous dans un endroit calme et, si possible, mettez un casque.\n• Autorisez le **micro et la caméra** quand le navigateur le demande.\n• Si les diapositives ne s’affichent pas, actualisez la page (Ctrl+Maj+R).',
      es:
        'Unos minutos antes de la clase, la tarjeta de arriba de tu panel dice **Starting Soon!** — pulsa **Join Classroom**.\nAntes de entrar:\n• Busca un sitio tranquilo y, si puedes, usa auriculares.\n• Permite el **micrófono y la cámara** cuando el navegador lo pida.\n• Si no se ven las diapositivas, actualiza la página (Ctrl+Mayús+R).',
      ar:
        'قبل الدرس ببضع دقائق تُظهر البطاقة أعلى لوحتك عبارة **Starting Soon!** — اضغط **Join Classroom**.\nقبل الدخول:\n• اجلس في مكان هادئ واستخدم سماعات إن أمكن.\n• اسمح بـ**الميكروفون والكاميرا** عندما يطلب المتصفح ذلك.\n• إن لم تظهر الشرائح فحدّث الصفحة (Ctrl+Shift+R).',
      tr:
        'Dersten birkaç dakika önce panonuzun üstündeki kart **Starting Soon!** der — **Join Classroom**’a basın.\nKatılmadan önce:\n• Sessiz bir yere oturun, mümkünse kulaklık kullanın.\n• Tarayıcı sorunca **mikrofon ve kameraya** izin verin.\n• Slaytlar görünmezse sayfayı yenileyin (Ctrl+Shift+R).',
    },
    actions: ['lessons'],
  },

  // ───────────────────────────────────────────────────────────── NO-SHOW / LATE
  {
    id: 'missed',
    q: {
      en: 'I missed or I am late for my lesson',
      fr: 'J’ai manqué mon cours ou je suis en retard',
      es: 'Perdí mi clase o llego tarde',
      ar: 'فاتني الدرس أو أنا متأخر',
      tr: 'Dersi kaçırdım ya da geç kaldım',
    },
    keywords: {
      en: ['missed', 'miss my lesson', 'no show', 'no-show', 'late', 'forgot my lesson', 'did not attend', 'absent', 'absence'],
      fr: ['manque', 'rate mon cours', 'retard', 'en retard', 'oublie mon cours', 'absent', 'absence'],
      es: ['perdi', 'falte', 'no asisti', 'tarde', 'llego tarde', 'olvide mi clase', 'ausente', 'ausencia'],
      ar: ['فاتني', 'تاخرت', 'متاخر', 'تاخير', 'غياب', 'نسيت درسي', 'لم احضر'],
      tr: ['kacirdim', 'gec kaldim', 'gec', 'unuttum', 'katilmadim', 'devamsiz'],
    },
    a: {
      en:
        'If you are late, join as soon as you can — your teacher is waiting for you.\nIf you miss a lesson without cancelling, the credit is not returned (the teacher reserved that time for you). To avoid it, cancel or reschedule at least 5 days before. For an exceptional situation, write to ' + SUPPORT_EMAIL + '.',
      fr:
        'Si vous êtes en retard, rejoignez dès que possible — votre professeur vous attend.\nSi vous manquez un cours sans l’annuler, le crédit n’est pas rendu (le professeur avait réservé ce temps pour vous). Pour l’éviter, annulez ou reprogrammez au moins 5 jours avant. En cas de situation exceptionnelle, écrivez à ' + SUPPORT_EMAIL + '.',
      es:
        'Si llegas tarde, entra en cuanto puedas: tu profesor te espera.\nSi no asistes sin cancelar, el crédito no se devuelve (el profesor reservó ese tiempo para ti). Para evitarlo, cancela o cambia la clase al menos 5 días antes. Si fue algo excepcional, escribe a ' + SUPPORT_EMAIL + '.',
      ar:
        'إذا تأخرت فانضم بأسرع ما يمكن، فمعلّمك بانتظارك.\nإذا فاتك درس دون إلغاء فلا يُعاد الرصيد (لأن المعلّم حجز الوقت لك). ولتفادي ذلك ألغِ أو غيّر الموعد قبل 5 أيام على الأقل. وفي حالة استثنائية راسل ' + SUPPORT_EMAIL + '.',
      tr:
        'Geç kaldıysanız mümkün olan en kısa sürede katılın — öğretmeniniz sizi bekliyor.\nİptal etmeden dersi kaçırırsanız kredi iade edilmez (öğretmen bu zamanı sizin için ayırdı). Bunu önlemek için en az 5 gün önce iptal edin veya saatini değiştirin. Olağanüstü bir durumda ' + SUPPORT_EMAIL + ' adresine yazın.',
    },
    actions: ['refund'],
  },

  // ───────────────────────────────────────────────────────────── NO SLOTS / TEACHER
  {
    id: 'slots',
    q: {
      en: 'I can’t see any available times',
      fr: 'Je ne vois aucun horaire disponible',
      es: 'No veo horarios disponibles',
      ar: 'لا أرى أي مواعيد متاحة',
      tr: 'Uygun saat göremiyorum',
    },
    keywords: {
      en: ['no slots', 'available times', 'available time', 'available slots', 'any times', 'any slots', 'no free times', 'no available', 'no times', 'no teacher', 'nothing available', 'not available', 'empty calendar', 'no time slots', 'full', 'another teacher', 'change teacher', 'different teacher', 'switch teacher'],
      fr: ['aucun horaire', 'pas de creneau', 'pas d horaire', 'aucun creneau', 'pas disponible', 'indisponible', 'pas de professeur', 'autre professeur', 'changer de professeur', 'changer de prof', 'calendrier vide'],
      es: ['sin horarios', 'no hay horarios', 'no hay huecos', 'no disponible', 'sin profesor', 'otro profesor', 'cambiar de profesor', 'calendario vacio'],
      ar: ['لا توجد مواعيد', 'لا مواعيد', 'لا يوجد وقت', 'غير متاح', 'لا يوجد معلم', 'معلم اخر', 'تغيير المعلم', 'تغيير المدرس'],
      tr: ['musait saat yok', 'uygun saat', 'saat goremiyorum', 'saat yok', 'bos saat', 'uygun degil', 'ogretmen yok', 'baska ogretmen', 'ogretmen degistir', 'takvim bos'],
    },
    a: {
      en:
        'Times come from your teacher’s calendar, and teachers add new times regularly.\n• Try another day (the highlighted days in the calendar have free times).\n• Try another teacher — each lesson can be with a different one.\n• Check back later. If you never see any time, write to ' + SUPPORT_EMAIL + '.',
      fr:
        'Les horaires viennent du calendrier du professeur, et les professeurs ajoutent régulièrement de nouveaux créneaux.\n• Essayez un autre jour (les jours en couleur dans le calendrier ont des places).\n• Essayez un autre professeur — chaque cours peut se faire avec un professeur différent.\n• Revenez plus tard. Si vous ne voyez jamais d’horaire, écrivez à ' + SUPPORT_EMAIL + '.',
      es:
        'Los horarios vienen del calendario del profesor, y los profesores añaden horarios nuevos con regularidad.\n• Prueba otro día (los días resaltados en el calendario tienen huecos libres).\n• Prueba con otro profesor: cada clase puede ser con uno distinto.\n• Vuelve más tarde. Si nunca ves ninguno, escribe a ' + SUPPORT_EMAIL + '.',
      ar:
        'المواعيد تأتي من تقويم المعلّم، ويضيف المعلّمون مواعيد جديدة باستمرار.\n• جرّب يومًا آخر (الأيام الملوّنة في التقويم فيها أوقات متاحة).\n• جرّب معلّمًا آخر — يمكن أن يكون لكل درس معلّم مختلف.\n• عُد لاحقًا. وإن لم تظهر لك أي مواعيد أبدًا فراسل ' + SUPPORT_EMAIL + '.',
      tr:
        'Saatler öğretmeninizin takviminden gelir ve öğretmenler düzenli olarak yeni saatler ekler.\n• Başka bir gün deneyin (takvimde renkli günlerde boş saat var).\n• Başka bir öğretmen deneyin — her ders farklı bir öğretmenle olabilir.\n• Daha sonra tekrar bakın. Hiç saat görmüyorsanız ' + SUPPORT_EMAIL + ' adresine yazın.',
    },
    actions: ['book'],
  },

  // ───────────────────────────────────────────────────────────── TECH
  {
    id: 'tech',
    q: {
      en: 'My microphone, camera or video does not work',
      fr: 'Mon micro, ma caméra ou ma vidéo ne marche pas',
      es: 'Mi micrófono, cámara o vídeo no funciona',
      ar: 'الميكروفون أو الكاميرا أو الفيديو لا يعمل',
      tr: 'Mikrofonum, kameram veya videom çalışmıyor',
    },
    keywords: {
      en: ['mic', 'microphone', 'camera', 'webcam', 'video', 'laggy', 'lag', 'freezing', 'frozen', 'sound', 'audio', 'cannot hear', 'can t hear', 'no sound', 'slides', 'not loading', 'bug', 'problem', 'error', 'not working', 'broken', 'internet'],
      fr: ['micro', 'microphone', 'camera', 'webcam', 'video', 'saccade', 'lent', 'gele', 'le son', 'audio', 'je n entends pas', 'pas de son', 'diapositive', 'ne charge pas', 'bug', 'probleme', 'erreur', 'ne marche pas', 'ne fonctionne pas', 'connexion internet'],
      es: ['microfono', 'camara', 'webcam', 'video', 'lento', 'congela', 'sonido', 'audio', 'no oigo', 'sin sonido', 'diapositivas', 'no carga', 'error', 'problema', 'no funciona', 'falla', 'internet'],
      ar: ['ميكروفون', 'مايك', 'كاميرا', 'فيديو', 'بطيء', 'تقطع', 'صوت', 'لا اسمع', 'لا يوجد صوت', 'الشرائح', 'لا يعمل', 'مشكله', 'خطا', 'انترنت'],
      tr: ['mikrofon', 'mikrofon', 'kamera', 'video', 'donuyor', 'kasma', 'ses', 'duyamiyorum', 'ses yok', 'slayt', 'yuklenmiyor', 'hata', 'sorun', 'calismiyor', 'internet'],
    },
    a: {
      en:
        'Quick fixes:\n• **Microphone / camera:** in the browser go to Site settings and allow them; unplug and re-plug the headset (reconnect Bluetooth); restart the browser.\n• **Slides not showing:** refresh with Ctrl+Shift+R and update your browser.\n• **Laggy video:** switch the camera off for a moment so the audio stays clear, close other tabs and apps, use a cable connection if you can.\nStill stuck? Write to ' + SUPPORT_EMAIL + ' and tell us what you see.',
      fr:
        'Solutions rapides :\n• **Micro / caméra :** dans le navigateur, ouvrez les paramètres du site et autorisez-les ; débranchez et rebranchez le casque (reconnectez le Bluetooth) ; redémarrez le navigateur.\n• **Diapositives qui ne s’affichent pas :** actualisez avec Ctrl+Maj+R et mettez le navigateur à jour.\n• **Vidéo qui saccade :** coupez un instant la caméra pour garder un son clair, fermez les autres onglets et applications, utilisez un câble réseau si possible.\nToujours bloqué ? Écrivez à ' + SUPPORT_EMAIL + ' en décrivant ce que vous voyez.',
      es:
        'Soluciones rápidas:\n• **Micrófono / cámara:** en el navegador abre la configuración del sitio y permítelos; desconecta y vuelve a conectar los auriculares (reconecta el Bluetooth); reinicia el navegador.\n• **Las diapositivas no se ven:** actualiza con Ctrl+Mayús+R y actualiza el navegador.\n• **Vídeo con retraso:** apaga un momento la cámara para mantener el audio claro, cierra otras pestañas y aplicaciones, usa cable de red si puedes.\n¿Sigue sin funcionar? Escribe a ' + SUPPORT_EMAIL + ' contando qué ves.',
      ar:
        'حلول سريعة:\n• **الميكروفون / الكاميرا:** من إعدادات الموقع في المتصفح اسمح بهما؛ افصل السماعة وأعد توصيلها (أعد اقتران البلوتوث)؛ أعد تشغيل المتصفح.\n• **الشرائح لا تظهر:** حدّث الصفحة بـ Ctrl+Shift+R وحدّث المتصفح.\n• **الفيديو بطيء:** أوقف الكاميرا لحظة ليبقى الصوت واضحًا، أغلق التبويبات والتطبيقات الأخرى، واستخدم كابل شبكة إن أمكن.\nما زالت المشكلة؟ راسل ' + SUPPORT_EMAIL + ' واشرح ما تراه.',
      tr:
        'Hızlı çözümler:\n• **Mikrofon / kamera:** tarayıcıda site ayarlarından izin verin; kulaklığı çıkarıp takın (Bluetooth’u yeniden bağlayın); tarayıcıyı yeniden başlatın.\n• **Slaytlar görünmüyor:** Ctrl+Shift+R ile yenileyin ve tarayıcıyı güncelleyin.\n• **Video takılıyor:** sesin net kalması için kamerayı bir süre kapatın, diğer sekme ve uygulamaları kapatın, mümkünse kablolu bağlantı kullanın.\nHâlâ olmuyorsa ' + SUPPORT_EMAIL + ' adresine ne gördüğünüzü yazın.',
    },
  },

  // ───────────────────────────────────────────────────────────── HOMEWORK
  {
    id: 'homework',
    q: {
      en: 'Where is my homework?',
      fr: 'Où sont mes devoirs ?',
      es: '¿Dónde está mi tarea?',
      ar: 'أين واجباتي؟',
      tr: 'Ödevim nerede?',
    },
    keywords: {
      en: ['homework', 'assignment', 'quest', 'practice at home', 'exercise'],
      fr: ['devoir', 'devoirs', 'exercice', 'quete', 'travail a la maison'],
      es: ['tarea', 'tareas', 'deberes', 'ejercicio', 'mision'],
      ar: ['واجب', 'واجبات', 'تمرين', 'مهمه'],
      tr: ['odev', 'odevler', 'alistirma', 'gorev'],
    },
    a: {
      en: 'Open **Homework** in the menu. After each finished lesson, its homework quest appears there — play it to earn XP. Before your first finished lesson the page says “No homework yet”.',
      fr: 'Ouvrez **Homework** dans le menu. Après chaque cours terminé, sa quête de devoirs apparaît là — jouez-la pour gagner de l’XP. Avant votre premier cours terminé, la page indique « No homework yet ».',
      es: 'Abre **Homework** en el menú. Después de cada clase terminada, su misión de tarea aparece ahí: juégala para ganar XP. Antes de tu primera clase terminada, la página dice “No homework yet”.',
      ar: 'افتح **Homework** من القائمة. بعد كل درس منتهٍ تظهر مهمة واجبه هناك — العبها لتكسب نقاط XP. وقبل إنهاء أول درس تقول الصفحة “No homework yet”.',
      tr: 'Menüden **Homework**’ü açın. Biten her dersin ödev görevi orada görünür — XP kazanmak için oynayın. İlk dersiniz bitmeden sayfada “No homework yet” yazar.',
    },
    actions: ['homework'],
  },

  // ───────────────────────────────────────────────────────────── GAMES
  {
    id: 'games',
    q: {
      en: 'Where are the games?',
      fr: 'Où sont les jeux ?',
      es: '¿Dónde están los juegos?',
      ar: 'أين الألعاب؟',
      tr: 'Oyunlar nerede?',
    },
    keywords: {
      en: ['game', 'games', 'play', 'xp', 'coins', 'points', 'fun', 'alphabet express', 'magic show'],
      fr: ['jeu', 'jeux', 'jouer', 'xp', 'pieces', 'points', 'amusant', 'alphabet express', 'magic show'],
      es: ['juego', 'juegos', 'jugar', 'xp', 'monedas', 'puntos', 'divertido', 'alphabet express', 'magic show'],
      ar: ['لعبه', 'العاب', 'العب', 'نقاط', 'عملات', 'xp'],
      tr: ['oyun', 'oyunlar', 'oyna', 'xp', 'jeton', 'puan', 'eglence'],
    },
    a: {
      en: 'Open **Games** in the menu to see the **Game Library**. Pick a game and press **Play**. Each game has several stops that unlock one after the other, and games earn you XP and coins you can see on your dashboard.',
      fr: 'Ouvrez **Games** dans le menu pour voir la **Game Library**. Choisissez un jeu et appuyez sur **Play**. Chaque jeu a plusieurs étapes qui se débloquent l’une après l’autre, et les jeux font gagner de l’XP et des pièces visibles sur votre tableau de bord.',
      es: 'Abre **Games** en el menú para ver la **Game Library**. Elige un juego y pulsa **Play**. Cada juego tiene varias paradas que se desbloquean una tras otra, y los juegos te dan XP y monedas que verás en tu panel.',
      ar: 'افتح **Games** من القائمة لترى **Game Library**. اختر لعبة واضغط **Play**. لكل لعبة عدة محطات تُفتح واحدة بعد الأخرى، وتمنحك الألعاب نقاط XP وعملات تظهر في لوحتك.',
      tr: 'Menüden **Games**’i açarak **Game Library**’yi görün. Bir oyun seçip **Play**’e basın. Her oyunun sırayla açılan birkaç durağı vardır; oyunlar panonuzda görünen XP ve jeton kazandırır.',
    },
    actions: ['games'],
  },

  // ───────────────────────────────────────────────────────────── LEVEL / PLACEMENT / PROGRESS
  {
    id: 'level',
    q: {
      en: 'What is the placement test? How do I see my progress?',
      fr: 'C’est quoi le test de niveau ? Comment voir mes progrès ?',
      es: '¿Qué es la prueba de nivel? ¿Cómo veo mi progreso?',
      ar: 'ما اختبار تحديد المستوى؟ كيف أرى تقدمي؟',
      tr: 'Seviye testi nedir? İlerlememi nasıl görürüm?',
    },
    keywords: {
      en: ['placement', 'level', 'test', 'progress', 'beginner', 'learning path', 'certificate', 'vocabulary', 'grammar', 'skill', 'milestone', 'a1', 'pre-a1'],
      fr: ['test de niveau', 'niveau', 'test', 'progres', 'progression', 'debutant', 'parcours', 'certificat', 'vocabulaire', 'grammaire', 'competence'],
      es: ['prueba de nivel', 'nivel', 'prueba', 'progreso', 'principiante', 'ruta', 'certificado', 'vocabulario', 'gramatica', 'habilidad'],
      ar: ['اختبار تحديد المستوى', 'المستوى', 'اختبار', 'تقدم', 'مبتدئ', 'المسار', 'شهاده', 'مفردات', 'قواعد'],
      tr: ['seviye testi', 'seviye', 'test', 'ilerleme', 'baslangic', 'ogrenme yolu', 'sertifika', 'kelime', 'dilbilgisi', 'beceri'],
    },
    a: {
      en:
        'The first time you log in, Pip the fox offers two ways to start: **true beginner** (skip the test and start from the basics) or the **placement test** (about 5 minutes, up to 15 questions, finds your exact level).\nYour level (for example Pre-A1) shows on your dashboard. To follow your progress open **My Learning Path**, **Map of Sounds**, **Vocabulary Vault**, **Grammar Journal**, **Mastery Milestones** and **Certificates** in the menu.',
      fr:
        'À votre première connexion, Pip le renard propose deux façons de commencer : **vrai débutant** (on saute le test et on commence par les bases) ou le **test de niveau** (environ 5 minutes, jusqu’à 15 questions, pour trouver votre niveau exact).\nVotre niveau (par exemple Pre-A1) s’affiche sur votre tableau de bord. Pour suivre vos progrès, ouvrez dans le menu **My Learning Path**, **Map of Sounds**, **Vocabulary Vault**, **Grammar Journal**, **Mastery Milestones** et **Certificates**.',
      es:
        'La primera vez que entras, Pip el zorro ofrece dos formas de empezar: **principiante total** (se omite la prueba y se empieza desde lo básico) o la **prueba de nivel** (unos 5 minutos, hasta 15 preguntas, para hallar tu nivel exacto).\nTu nivel (por ejemplo Pre-A1) aparece en tu panel. Para seguir tu progreso abre en el menú **My Learning Path**, **Map of Sounds**, **Vocabulary Vault**, **Grammar Journal**, **Mastery Milestones** y **Certificates**.',
      ar:
        'عند أول تسجيل دخول يقدّم لك الثعلب Pip طريقتين للبدء: **مبتدئ تمامًا** (تخطّي الاختبار والبدء من الأساسيات) أو **اختبار تحديد المستوى** (نحو 5 دقائق وحتى 15 سؤالًا لمعرفة مستواك بدقة).\nيظهر مستواك (مثل Pre-A1) في لوحتك. ولمتابعة تقدمك افتح من القائمة **My Learning Path** و**Map of Sounds** و**Vocabulary Vault** و**Grammar Journal** و**Mastery Milestones** و**Certificates**.',
      tr:
        'İlk girişinizde tilki Pip başlamanın iki yolunu sunar: **tamamen yeni başlayan** (testi atlayıp temelden başlar) veya **seviye testi** (yaklaşık 5 dakika, en fazla 15 soru, tam seviyenizi bulur).\nSeviyeniz (örneğin Pre-A1) panonuzda görünür. İlerlemenizi izlemek için menüden **My Learning Path**, **Map of Sounds**, **Vocabulary Vault**, **Grammar Journal**, **Mastery Milestones** ve **Certificates**’ı açın.',
    },
    actions: ['path'],
  },

  // ───────────────────────────────────────────────────────────── INDIVIDUAL → FAMILY (before 'family': wins ties)
  {
    id: 'convert',
    q: {
      en: 'Can I switch my account to a family account?',
      fr: 'Puis-je passer mon compte en compte famille ?',
      es: '¿Puedo pasar mi cuenta a cuenta familiar?',
      ar: 'هل يمكنني تحويل حسابي إلى حساب عائلة؟',
      tr: 'Hesabımı aile hesabına çevirebilir miyim?',
    },
    keywords: {
      en: ['family account', 'switch to family', 'switch my account', 'convert', 'individual account', 'individual to family', 'become a parent', 'turn my account into'],
      fr: ['compte famille', 'passer en compte famille', 'passer a un compte famille', 'convertir', 'compte individuel', 'transformer mon compte', 'devenir parent'],
      es: ['cuenta familiar', 'pasar a cuenta familiar', 'convertir mi cuenta', 'cuenta individual', 'transformar mi cuenta'],
      ar: ['حساب عائله', 'التحويل الى حساب عائله', 'تحويل حسابي', 'حساب فردي'],
      tr: ['aile hesabi', 'aile hesabina gec', 'hesabimi donustur', 'bireysel hesap', 'aile hesabina cevir'],
    },
    a: {
      en:
        'Yes. If you signed up as an individual but you are really a parent: open **My Profile**, scroll to **Family account** and press **Switch to a family account**. You land on the family dashboard, where you add your children.\n• Your email address must be confirmed.\n• You must have **no upcoming lessons** booked on this account — finish or cancel them first.\n• Your own lessons and progress stay saved but do not open from this login any more; to keep learning yourself, add yourself as a learner in your family.\n• A child’s own profile cannot switch: the parent manages it from their family account.',
      fr:
        'Oui. Si vous vous êtes inscrit en compte individuel mais que vous êtes en fait parent : ouvrez **My Profile**, descendez jusqu’à **Family account** et appuyez sur **Switch to a family account**. Vous arrivez sur le tableau de bord famille, où vous ajoutez vos enfants.\n• Votre adresse e-mail doit être confirmée.\n• Vous ne devez avoir **aucun cours à venir** réservé sur ce compte — terminez-les ou annulez-les d’abord.\n• Vos propres cours et votre progression restent enregistrés mais ne s’ouvrent plus depuis cette connexion ; pour continuer à apprendre, ajoutez-vous comme apprenant dans votre famille.\n• Le profil d’un enfant ne peut pas changer : le parent le gère depuis son compte famille.',
      es:
        'Sí. Si te registraste con una cuenta individual pero eres en realidad padre o madre: abre **My Profile**, baja hasta **Family account** y pulsa **Switch to a family account**. Llegarás al panel familiar, donde añades a tus hijos.\n• Tu correo debe estar confirmado.\n• No debes tener **ninguna clase próxima** reservada en esta cuenta — termínalas o cancélalas antes.\n• Tus propias clases y tu progreso se conservan pero ya no se abren desde este acceso; para seguir aprendiendo, añádete como alumno en tu familia.\n• El perfil de un hijo no puede cambiar: lo gestiona el padre o la madre desde su cuenta familiar.',
      ar:
        'نعم. إذا سجّلت بحساب فردي لكنك في الواقع ولي أمر: افتح **My Profile** ثم انزل إلى **Family account** واضغط **Switch to a family account**. ستصل إلى لوحة العائلة حيث تضيف أطفالك.\n• يجب أن يكون بريدك الإلكتروني مؤكَّدًا.\n• يجب ألا يكون لديك **أي درس قادم** محجوز على هذا الحساب — أنهِه أو ألغِه أولًا.\n• تبقى دروسك الخاصة وتقدمك محفوظة لكنها لا تُفتح من هذا الدخول بعد الآن؛ ولمواصلة التعلّم أضِف نفسك متعلّمًا في عائلتك.\n• لا يمكن تحويل ملف طفل: يديره ولي الأمر من حساب العائلة.',
      tr:
        'Evet. Bireysel hesapla kaydolduysanız ama aslında ebeveynseniz: **My Profile**’ı açın, **Family account** bölümüne inin ve **Switch to a family account**’a basın. Çocuklarınızı eklediğiniz aile panosuna geçersiniz.\n• E-posta adresiniz onaylı olmalı.\n• Bu hesapta **yaklaşan hiçbir ders** ayrılmış olmamalı — önce bitirin veya iptal edin.\n• Kendi dersleriniz ve ilerlemeniz kayıtlı kalır ama artık bu girişten açılmaz; öğrenmeye devam etmek için kendinizi ailenizde öğrenci olarak ekleyin.\n• Bir çocuğun kendi profili geçiş yapamaz: ebeveyn onu aile hesabından yönetir.',
    },
    actions: ['profile'],
  },

  // ───────────────────────────────────────────────────────────── FAMILY
  {
    id: 'family',
    q: {
      en: 'Parents: how do I add a child or switch profile?',
      fr: 'Parents : comment ajouter un enfant ou changer de profil ?',
      es: 'Padres: ¿cómo añado un hijo o cambio de perfil?',
      ar: 'أولياء الأمور: كيف أضيف طفلًا أو أبدّل الملف؟',
      tr: 'Ebeveynler: çocuk nasıl eklerim, profil nasıl değiştiririm?',
    },
    keywords: {
      en: ['family', 'parent', 'child', 'children', 'kid', 'add a child', 'second child', 'sibling', 'pin', 'switch profile', 'who is learning', 'my son', 'my daughter'],
      fr: ['famille', 'parent', 'enfant', 'enfants', 'ajouter un enfant', 'deuxieme enfant', 'frere', 'soeur', 'code pin', 'pin', 'changer de profil', 'qui apprend', 'mon fils', 'ma fille'],
      es: ['familia', 'padre', 'madre', 'padres', 'hijo', 'hija', 'hijos', 'nino', 'anadir un hijo', 'segundo hijo', 'hermano', 'pin', 'cambiar de perfil', 'quien aprende'],
      ar: ['عائله', 'ولي امر', 'طفل', 'اطفال', 'ابني', 'ابنتي', 'اضافه طفل', 'اخ', 'اخت', 'رمز pin', 'تبديل الملف', 'من يتعلم'],
      tr: ['aile', 'ebeveyn', 'cocuk', 'cocuklar', 'cocuk ekle', 'ikinci cocuk', 'kardes', 'pin', 'profil degistir', 'kim ogreniyor', 'oglum', 'kizim'],
    },
    a: {
      en:
        'With a **family account**, one parent login manages every child.\n• **Add a child:** family dashboard → **Add a family member**.\n• **Open a child’s space:** the **Who’s learning today?** screen (tap the child’s name) or **Open a learning space** on the family dashboard.\n• A **4-digit PIN** protects the parent area, so a child cannot go back to it without the code. If you forgot the PIN, write to ' + SUPPORT_EMAIL + '.\n• The family dashboard shows how many lessons each child has left; use the **Lessons** tab there to add more.',
      fr:
        'Avec un **compte famille**, une seule connexion de parent gère tous les enfants.\n• **Ajouter un enfant :** tableau de bord famille → **Ajouter un membre de la famille**.\n• **Ouvrir l’espace d’un enfant :** l’écran **Who’s learning today?** (touchez le prénom) ou **Ouvrir un espace d’apprentissage** sur le tableau de bord famille.\n• Un **code PIN à 4 chiffres** protège l’espace parent : l’enfant ne peut pas y retourner sans le code. Si vous avez oublié le PIN, écrivez à ' + SUPPORT_EMAIL + '.\n• Le tableau de bord famille indique les leçons restantes de chaque enfant ; utilisez-y l’onglet **Cours** pour en ajouter.',
      es:
        'Con una **cuenta familiar**, un solo acceso de padre o madre gestiona a todos los hijos.\n• **Añadir un hijo:** panel familiar → **Añadir un miembro de la familia**.\n• **Abrir el espacio de un hijo:** la pantalla **Who’s learning today?** (toca su nombre) o **Abrir un espacio de aprendizaje** en el panel familiar.\n• Un **PIN de 4 dígitos** protege el área de los padres, así el niño no puede volver sin el código. Si olvidaste el PIN, escribe a ' + SUPPORT_EMAIL + '.\n• El panel familiar muestra las clases que le quedan a cada hijo; usa ahí la pestaña **Clases** para añadir más.',
      ar:
        'مع **حساب العائلة** يدير دخول واحد لولي الأمر جميع الأطفال.\n• **إضافة طفل:** لوحة العائلة ← **إضافة فرد من العائلة**.\n• **فتح مساحة طفل:** شاشة **Who’s learning today?** (المس اسم الطفل) أو **فتح مساحة تعلّم** في لوحة العائلة.\n• يحمي **رمز PIN من 4 أرقام** منطقة ولي الأمر فلا يستطيع الطفل العودة إليها دون الرمز. إن نسيت الرمز راسل ' + SUPPORT_EMAIL + '.\n• تعرض لوحة العائلة الدروس المتبقية لكل طفل؛ استخدم هناك تبويب **الدروس** لإضافة المزيد.',
      tr:
        '**Aile hesabında** tek bir ebeveyn girişi tüm çocukları yönetir.\n• **Çocuk eklemek:** aile panosu → **Aile üyesi ekle**.\n• **Çocuğun alanını açmak:** **Who’s learning today?** ekranı (çocuğun adına dokunun) veya aile panosunda **Öğrenme alanı aç**.\n• **4 haneli PIN** ebeveyn alanını korur; çocuk kodsuz geri dönemez. PIN’i unuttuysanız ' + SUPPORT_EMAIL + ' adresine yazın.\n• Aile panosu her çocuğun kalan derslerini gösterir; daha fazlası için orada **Dersler** sekmesini kullanın.',
    },
  },

  // ───────────────────────────────────────────────────────────── ACCOUNT
  {
    id: 'account',
    q: {
      en: 'Password, email, language or profile',
      fr: 'Mot de passe, e-mail, langue ou profil',
      es: 'Contraseña, correo, idioma o perfil',
      ar: 'كلمة المرور أو البريد أو اللغة أو الملف',
      tr: 'Şifre, e-posta, dil veya profil',
    },
    keywords: {
      en: ['password', 'forgot password', 'reset password', 'email', 'change email', 'language', 'profile', 'account', 'log in', 'login', 'sign in', 'cannot log in', 'logout', 'name', 'avatar'],
      fr: ['mot de passe', 'oublie mon mot de passe', 'mot de passe oublie', 'reinitialiser', 'e-mail', 'email', 'changer mon email', 'langue', 'profil', 'compte', 'connexion', 'me connecter', 'deconnexion', 'nom', 'avatar'],
      es: ['contrasena', 'olvide mi contrasena', 'restablecer', 'correo', 'email', 'cambiar mi correo', 'idioma', 'perfil', 'cuenta', 'iniciar sesion', 'no puedo entrar', 'cerrar sesion', 'nombre', 'avatar'],
      ar: ['كلمه المرور', 'كلمة السر', 'نسيت كلمه المرور', 'البريد', 'ايميل', 'تغيير البريد', 'اللغه', 'الملف الشخصي', 'حساب', 'تسجيل الدخول', 'لا استطيع الدخول', 'تسجيل الخروج', 'الاسم'],
      tr: ['sifre', 'sifremi unuttum', 'sifre sifirla', 'e-posta', 'eposta', 'email', 'e-posta degistir', 'dil', 'profil', 'hesap', 'giris', 'giris yapamiyorum', 'cikis', 'isim', 'avatar'],
    },
    a: {
      en:
        '• **Forgot your password:** on the login page press **Forgot password?** and follow the email.\n• **Name, email, avatar:** open **My Profile** in the menu. A new email gets a confirmation link first.\n• **Language:** the globe icon at the top right of the dashboard, or **Dashboard language** in My Profile.\n• Can’t log in at all? Write to ' + SUPPORT_EMAIL + '.',
      fr:
        '• **Mot de passe oublié :** sur la page de connexion, appuyez sur **Mot de passe oublié ?** et suivez l’e-mail reçu.\n• **Nom, e-mail, avatar :** ouvrez **My Profile** dans le menu. Un nouvel e-mail reçoit d’abord un lien de confirmation.\n• **Langue :** le globe en haut à droite du tableau de bord, ou **Langue du tableau de bord** dans My Profile.\n• Impossible de vous connecter ? Écrivez à ' + SUPPORT_EMAIL + '.',
      es:
        '• **Olvidaste la contraseña:** en la página de acceso pulsa **¿Olvidaste tu contraseña?** y sigue el correo.\n• **Nombre, correo, avatar:** abre **My Profile** en el menú. Un correo nuevo recibe primero un enlace de confirmación.\n• **Idioma:** el globo arriba a la derecha del panel, o **Idioma del panel** en My Profile.\n• ¿No puedes entrar? Escribe a ' + SUPPORT_EMAIL + '.',
      ar:
        '• **نسيت كلمة المرور:** في صفحة الدخول اضغط **نسيت كلمة المرور؟** واتبع الرسالة التي تصلك.\n• **الاسم والبريد والصورة:** افتح **My Profile** من القائمة. يصل البريد الجديد أولًا رابط تأكيد.\n• **اللغة:** رمز الكرة الأرضية أعلى اللوحة، أو **لغة لوحة التحكم** في My Profile.\n• لا تستطيع الدخول إطلاقًا؟ راسل ' + SUPPORT_EMAIL + '.',
      tr:
        '• **Şifrenizi unuttuysanız:** giriş sayfasında **Şifremi unuttum?**’a basın ve gelen e-postayı izleyin.\n• **Ad, e-posta, avatar:** menüden **My Profile**’ı açın. Yeni e-postaya önce bir onay bağlantısı gönderilir.\n• **Dil:** panonun üstündeki dünya simgesi veya My Profile’daki **Pano dili**.\n• Hiç giriş yapamıyor musunuz? ' + SUPPORT_EMAIL + ' adresine yazın.',
    },
    actions: ['profile'],
  },

  // ───────────────────────────────────────────────────────────── CONTACT
  {
    id: 'contact',
    q: {
      en: 'How do I contact support?',
      fr: 'Comment contacter le support ?',
      es: '¿Cómo contacto con soporte?',
      ar: 'كيف أتواصل مع الدعم؟',
      tr: 'Destekle nasıl iletişime geçerim?',
    },
    keywords: {
      en: ['contact', 'support', 'help', 'human', 'person', 'agent', 'talk to someone', 'email you', 'complaint', 'speak to', 'phone', 'call'],
      fr: ['contact', 'contacter', 'support', 'aide', 'humain', 'personne', 'parler a quelqu un', 'reclamation', 'telephone', 'appeler'],
      es: ['contacto', 'contactar', 'soporte', 'ayuda', 'humano', 'persona', 'hablar con alguien', 'queja', 'telefono', 'llamar'],
      ar: ['تواصل', 'اتصال', 'دعم', 'مساعده', 'شخص', 'اتحدث', 'شكوى', 'هاتف', 'اتصل'],
      tr: ['iletisim', 'destek', 'yardim', 'insan', 'biri ile', 'sikayet', 'telefon', 'ara'],
    },
    a: {
      en: 'You can write to us at **' + SUPPORT_EMAIL + '** (any question) or **' + BILLING_EMAIL + '** (payments and refunds). You can also press “Send my question to the team” under any answer I could not solve.',
      fr: 'Vous pouvez nous écrire à **' + SUPPORT_EMAIL + '** (toute question) ou à **' + BILLING_EMAIL + '** (paiements et remboursements). Vous pouvez aussi appuyer sur « Envoyer ma question à l’équipe » sous une réponse qui ne vous a pas aidé.',
      es: 'Puedes escribirnos a **' + SUPPORT_EMAIL + '** (cualquier duda) o a **' + BILLING_EMAIL + '** (pagos y reembolsos). También puedes pulsar “Enviar mi pregunta al equipo” bajo una respuesta que no te haya servido.',
      ar: 'يمكنك مراسلتنا على **' + SUPPORT_EMAIL + '** (أي سؤال) أو **' + BILLING_EMAIL + '** (المدفوعات والاسترداد). ويمكنك أيضًا الضغط على «أرسل سؤالي إلى الفريق» تحت أي إجابة لم تحلّ مشكلتك.',
      tr: '**' + SUPPORT_EMAIL + '** (her soru) veya **' + BILLING_EMAIL + '** (ödemeler ve iadeler) adresine yazabilirsiniz. Sorununuzu çözmeyen bir cevabın altındaki “Sorumu ekibe gönder”e de basabilirsiniz.',
    },
    actions: ['email-support', 'email-billing'],
  },

  // ───────────────────────────────────────────────────────────── SMALL TALK
  {
    id: 'hello',
    q: { en: 'Hello', fr: 'Bonjour', es: 'Hola', ar: 'مرحبًا', tr: 'Merhaba' },
    keywords: {
      en: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'thanks', 'thank you', 'ok', 'okay', 'bye'],
      fr: ['bonjour', 'salut', 'coucou', 'bonsoir', 'merci', 'ok', 'au revoir'],
      es: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'gracias', 'vale', 'adios'],
      ar: ['مرحبا', 'اهلا', 'السلام عليكم', 'صباح الخير', 'مساء الخير', 'شكرا', 'حسنا', 'مع السلامه'],
      tr: ['merhaba', 'selam', 'gunaydin', 'iyi aksamlar', 'tesekkur', 'sag ol', 'tamam', 'hosca kal'],
    },
    a: {
      en: 'Hi! 👋 I can answer questions about booking, rescheduling, cancelling, refunds, credits, joining your lesson, homework and games. Pick a question below or type your own.',
      fr: 'Bonjour ! 👋 Je peux répondre aux questions sur la réservation, la reprogrammation, l’annulation, les remboursements, les crédits, l’accès au cours, les devoirs et les jeux. Choisissez une question ci-dessous ou écrivez la vôtre.',
      es: '¡Hola! 👋 Puedo responder dudas sobre reservar, cambiar la hora, cancelar, reembolsos, créditos, entrar a la clase, tareas y juegos. Elige una pregunta abajo o escribe la tuya.',
      ar: 'مرحبًا! 👋 يمكنني الإجابة عن الحجز وتغيير الموعد والإلغاء والاسترداد والأرصدة ودخول الدرس والواجبات والألعاب. اختر سؤالًا من الأسفل أو اكتب سؤالك.',
      tr: 'Merhaba! 👋 Ders ayırtma, saat değiştirme, iptal, iade, kredi, derse katılma, ödev ve oyunlar hakkında soruları yanıtlayabilirim. Aşağıdan bir soru seçin veya kendi sorunuzu yazın.',
    },
  },
];

/** Interface strings (the chat window itself). */
export const UI: Record<string, L10n> = {
  title: { en: 'Help assistant', fr: 'Assistant d’aide', es: 'Asistente de ayuda', ar: 'مساعد المساعدة', tr: 'Yardım asistanı' },
  subtitle: {
    en: 'Booking, rescheduling, cancelling, refunds…',
    fr: 'Réservation, reprogrammation, annulation, remboursement…',
    es: 'Reservas, cambios, cancelaciones, reembolsos…',
    ar: 'الحجز وتغيير الموعد والإلغاء والاسترداد…',
    tr: 'Rezervasyon, saat değişikliği, iptal, iade…',
  },
  open: { en: 'Open the help assistant', fr: 'Ouvrir l’assistant d’aide', es: 'Abrir el asistente de ayuda', ar: 'افتح مساعد المساعدة', tr: 'Yardım asistanını aç' },
  close: { en: 'Close', fr: 'Fermer', es: 'Cerrar', ar: 'إغلاق', tr: 'Kapat' },
  placeholder: { en: 'Type your question…', fr: 'Écrivez votre question…', es: 'Escribe tu pregunta…', ar: 'اكتب سؤالك…', tr: 'Sorunuzu yazın…' },
  send: { en: 'Send', fr: 'Envoyer', es: 'Enviar', ar: 'إرسال', tr: 'Gönder' },
  greeting: {
    en: 'Hi! 👋 Ask me how to book, reschedule or cancel a lesson, about refunds, credits and more. Pick a question or type your own.',
    fr: 'Bonjour ! 👋 Demandez-moi comment réserver, reprogrammer ou annuler un cours, ou posez-moi vos questions sur les remboursements, les crédits… Choisissez une question ou écrivez la vôtre.',
    es: '¡Hola! 👋 Pregúntame cómo reservar, cambiar o cancelar una clase, o sobre reembolsos, créditos y más. Elige una pregunta o escribe la tuya.',
    ar: 'مرحبًا! 👋 اسألني كيف تحجز درسًا أو تغيّر موعده أو تلغيه، أو عن الاسترداد والأرصدة وغيرها. اختر سؤالًا أو اكتب سؤالك.',
    tr: 'Merhaba! 👋 Bir dersi nasıl ayırtacağınızı, saatini değiştireceğinizi veya iptal edeceğinizi, iade ve kredi gibi konuları sorabilirsiniz. Bir soru seçin veya kendi sorunuzu yazın.',
  },
  suggestions: { en: 'Popular questions', fr: 'Questions fréquentes', es: 'Preguntas frecuentes', ar: 'أسئلة شائعة', tr: 'Sık sorulanlar' },
  related: { en: 'You may also want to know', fr: 'Cela peut aussi vous intéresser', es: 'Quizá también te interese', ar: 'قد يهمك أيضًا', tr: 'Bunlar da ilginizi çekebilir' },
  notSure: {
    en: 'I am not sure I understood. Try different words, pick one of these topics, or contact the team.',
    fr: 'Je ne suis pas sûr d’avoir compris. Essayez d’autres mots, choisissez un de ces sujets ou contactez l’équipe.',
    es: 'No estoy seguro de haber entendido. Prueba con otras palabras, elige uno de estos temas o contacta con el equipo.',
    ar: 'لست متأكدًا أنني فهمت. جرّب كلمات أخرى أو اختر أحد هذه المواضيع أو تواصل مع الفريق.',
    tr: 'Anladığımdan emin değilim. Başka sözcükler deneyin, bu konulardan birini seçin veya ekiple iletişime geçin.',
  },
  sendToTeam: { en: 'Send my question to the team', fr: 'Envoyer ma question à l’équipe', es: 'Enviar mi pregunta al equipo', ar: 'أرسل سؤالي إلى الفريق', tr: 'Sorumu ekibe gönder' },
  sent: {
    en: 'Thank you — your question was sent to the team. They will reply by email.',
    fr: 'Merci — votre question a été envoyée à l’équipe. Elle vous répondra par e-mail.',
    es: 'Gracias: tu pregunta se envió al equipo. Te responderán por correo.',
    ar: 'شكرًا — أُرسل سؤالك إلى الفريق وسيردّون عليك بالبريد الإلكتروني.',
    tr: 'Teşekkürler — sorunuz ekibe gönderildi. E-posta ile yanıt verecekler.',
  },
  sendFailed: {
    en: 'I could not send it. Please email ' + SUPPORT_EMAIL + '.',
    fr: 'Impossible de l’envoyer. Écrivez à ' + SUPPORT_EMAIL + '.',
    es: 'No pude enviarlo. Escribe a ' + SUPPORT_EMAIL + '.',
    ar: 'تعذّر الإرسال. راسل ' + SUPPORT_EMAIL + '.',
    tr: 'Gönderemedim. Lütfen ' + SUPPORT_EMAIL + ' adresine yazın.',
  },
  helpful: { en: 'Was this helpful?', fr: 'Cette réponse vous aide ?', es: '¿Te sirvió?', ar: 'هل كانت مفيدة؟', tr: 'Faydalı oldu mu?' },
  yes: { en: 'Yes', fr: 'Oui', es: 'Sí', ar: 'نعم', tr: 'Evet' },
  no: { en: 'No', fr: 'Non', es: 'No', ar: 'لا', tr: 'Hayır' },
  thanksYes: { en: 'Great! Anything else?', fr: 'Parfait ! Autre chose ?', es: '¡Genial! ¿Algo más?', ar: 'رائع! هل من شيء آخر؟', tr: 'Harika! Başka bir şey var mı?' },
  disclaimer: {
    en: 'Automatic answers based on our published rules.',
    fr: 'Réponses automatiques basées sur nos règles publiées.',
    es: 'Respuestas automáticas basadas en nuestras reglas publicadas.',
    ar: 'إجابات تلقائية مبنية على قواعدنا المنشورة.',
    tr: 'Yayımlanmış kurallarımıza dayalı otomatik yanıtlar.',
  },
};

/**
 * Extra lines for PARENTS (the assistant on the family dashboard). The step-by-step answers above are written for a
 * student looking at their own dashboard; a parent first opens the child's space, or uses the Lessons tab to buy.
 */
export const FAMILY_NOTES: { open: L10n; buy: L10n } = {
  open: {
    en: '👨‍👩‍👧 **Parents:** open your child’s space first (**Open a learning space** at the top of this dashboard), then follow these steps from there.',
    fr: '👨‍👩‍👧 **Parents :** ouvrez d’abord l’espace de votre enfant (**Ouvrir un espace d’apprentissage**, en haut de ce tableau de bord), puis suivez ces étapes depuis là.',
    es: '👨‍👩‍👧 **Padres:** abrid primero el espacio de vuestro hijo (**Abrir un espacio de aprendizaje**, arriba en este panel) y seguid desde allí estos pasos.',
    ar: '👨‍👩‍👧 **أولياء الأمور:** افتحوا أولًا مساحة طفلكم (**فتح مساحة تعلّم** أعلى هذه اللوحة) ثم اتبعوا هذه الخطوات من هناك.',
    tr: '👨‍👩‍👧 **Ebeveynler:** önce çocuğunuzun alanını açın (bu panonun üstündeki **Öğrenme alanı aç**), sonra bu adımları oradan izleyin.',
  },
  buy: {
    en: '👨‍👩‍👧 **Here:** open the **Lessons** tab at the top of this dashboard — pick the child, then a pack (family packs can be shared between children with “Move lessons”).',
    fr: '👨‍👩‍👧 **Ici :** ouvrez l’onglet **Cours** en haut de ce tableau de bord — choisissez l’enfant, puis un pack (les packs famille se partagent entre les enfants avec « Move lessons »).',
    es: '👨‍👩‍👧 **Aquí:** abrid la pestaña **Clases** de arriba en este panel: elegid al hijo y luego un paquete (los paquetes familiares se reparten entre hijos con “Move lessons”).',
    ar: '👨‍👩‍👧 **هنا:** افتحوا تبويب **الدروس** أعلى هذه اللوحة — اختاروا الطفل ثم الباقة (يمكن تقاسم باقات العائلة بين الأطفال عبر “Move lessons”).',
    tr: '👨‍👩‍👧 **Burada:** bu panonun üstündeki **Dersler** sekmesini açın — çocuğu, sonra bir paketi seçin (aile paketleri “Move lessons” ile çocuklar arasında paylaşılır).',
  },
};
export const FAMILY_OPEN_TOPICS = ['book', 'reschedule', 'cancel', 'join', 'homework', 'games', 'level', 'trial'];
export const FAMILY_BUY_TOPICS = ['buy', 'credits'];
/** Buttons that only make sense on a student's own dashboard; a parent gets "Open a child's space" instead. */
export const FAMILY_HIDDEN_ACTIONS: HelpActionId[] = ['book', 'lessons', 'homework', 'games', 'path', 'profile'];
