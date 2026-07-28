export const metadata = {
  title: "سياسة الخصوصية وشروط الاستخدام | RoadX",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <h1 className="font-display text-3xl text-paper mb-8">
        سياسة الخصوصية وشروط الاستخدام
      </h1>

      <div className="space-y-8 text-muted leading-relaxed">

        <section>
          <h2 className="text-paper font-display text-xl mb-2">
            1. دور المنصة
          </h2>

          <p>
            تهدف منصة <strong>RoadX</strong> إلى تسهيل وصول المستخدمين إلى
            أحدث وأفضل الإصدارات الموسيقية من خلال عرض معلومات وروابط رسمية
            ووصف مختصر للأعمال الفنية.
          </p>

          <p className="mt-3">
            لا تستضيف المنصة أي ملفات صوتية أو مرئية، ولا تُعد طرفًا في أي
            عملية استماع أو تحميل أو شراء تتم عبر منصات خارجية.
          </p>
        </section>

        <section>
          <h2 className="text-paper font-display text-xl mb-2">
            2. الملكية الفكرية
          </h2>

          <p>
            جميع أسماء الفنانين والأغاني والألبومات والشعارات والأغلفة
            والعلامات التجارية المعروضة هي ملك لأصحابها، ويأتي استخدامها
            لأغراض التعريف بالمحتوى فقط، ولا يعني ذلك وجود أي شراكة أو تأييد
            من تلك الجهات ما لم يُذكر صراحة.
          </p>
        </section>

        <section>
          <h2 className="text-paper font-display text-xl mb-2">
            3. الروابط الخارجية
          </h2>

          <p>
            تحتوي المنصة على روابط تؤدي إلى خدمات خارجية مثل YouTube وSpotify
            وApple Music وDeezer وغيرها، ولا تتحمل RoadX أي مسؤولية عن محتوى
            تلك المواقع أو سياسات الخصوصية الخاصة بها أو مدى توفر خدماتها.
          </p>
        </section>

        <section>
          <h2 className="text-paper font-display text-xl mb-2">
            4. دقة البيانات
          </h2>

          <p>
            تعتمد بعض المعلومات المعروضة، مثل تواريخ الإصدار وعدد المتابعين
            ومؤشرات الرواج، على واجهات برمجية وخدمات خارجية، لذلك قد تتأخر
            البيانات أو تختلف عن الواقع، ولا تضمن المنصة تحديثها اللحظي أو
            دقتها الكاملة.
          </p>
        </section>

        <section>
          <h2 className="text-paper font-display text-xl mb-2">
            5. سياسة الخصوصية
          </h2>

          <p>
            تحترم منصة RoadX خصوصية مستخدميها، ولا تقوم ببيع أو تأجير أو
            مشاركة البيانات الشخصية مع أي طرف ثالث.
          </p>

          <p className="mt-3">
            قد يتم جمع بعض البيانات التقنية الضرورية، مثل نوع المتصفح أو
            الجهاز أو معلومات الاستخدام، بهدف تحسين الأداء والأمان وتجربة
            المستخدم فقط.
          </p>
        </section>

        <section>
          <h2 className="text-paper font-display text-xl mb-2">
            6. الاستخدام المقبول
          </h2>

          <p>
            يلتزم المستخدم بعدم استخدام المنصة لأي نشاط مخالف للقوانين أو
            محاولة استخراج بياناتها أو نسخها آليًا (Scraping) أو التأثير على
            عملها بأي وسيلة غير مصرح بها.
          </p>
        </section>

        <section>
          <h2 className="text-paper font-display text-xl mb-2">
            7. حدود المسؤولية
          </h2>

          <p>
            بما أن RoadX تؤدي دور الوسيط في عرض المعلومات والروابط فقط،
            فإن الخدمة تُقدَّم كما هي دون أي ضمانات صريحة أو ضمنية، ولا تتحمل
            المنصة أي مسؤولية عن أي خسائر أو أضرار قد تنشأ نتيجة استخدام
            الخدمات أو المواقع الخارجية.
          </p>
        </section>

        <section>
          <h2 className="text-paper font-display text-xl mb-2">
            8. طلبات إزالة المحتوى
          </h2>

          <p>
            إذا كنت مالكًا لحقوق نشر أو حقوق ملكية فكرية، وترى أن أحد
            العناصر المعروضة يخالف حقوقك، يرجى التواصل معنا عبر صفحة{" "}
            <a
              href="/contact"
              className="text-gold hover:underline"
            >
              تواصل معنا
            </a>
            ، وسنعمل على مراجعة الطلب واتخاذ الإجراء المناسب في أقرب وقت ممكن.
          </p>
        </section>

        <section>
          <h2 className="text-paper font-display text-xl mb-2">
            9. التعديلات
          </h2>

          <p>
            تحتفظ RoadX بحق تعديل هذه السياسة أو شروط الاستخدام في أي وقت،
            ويُعد استمرار استخدام المنصة بعد نشر أي تحديث موافقةً على النسخة
            المعدلة.
          </p>
        </section>

        <div className="border-t border-hairline/50 pt-5 text-xs text-muted">
          آخر تحديث: يوليو 2026
        </div>

      </div>
    </div>
  );
}
