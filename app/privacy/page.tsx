import { IconHome } from "@/components/roadx/icons";

export const metadata = {
  title: "سياسة الخصوصية وشروط الاستخدام | RoadX",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <div className="mb-6 flex justify-end">
          <a href="/" className="rx-press inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-bold text-gold transition-colors hover:bg-gold hover:text-gold-foreground">
            <IconHome size={18} />
            <span>العودة للرئيسية</span>
          </a>
        </div>

        <h1 className="text-3xl font-bold text-gold mb-8 text-right">
          سياسة الخصوصية وشروط الاستخدام
        </h1>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground text-right">

          <section>
            <h2 className="text-gold font-bold text-xl mb-3">1. دور المنصة</h2>
            <p>
              تهدف منصة <strong className="text-gold">RoadX</strong> إلى تسهيل وصول المستخدمين إلى
              أحدث وأفضل الإصدارات الموسيقية من خلال عرض معلومات وروابط رسمية
              ووصف مختصر للأعمال الفنية.
            </p>
            <p className="mt-3">
              لا تستضيف المنصة أي ملفات صوتية أو مرئية، ولا تُعد طرفاً في أي
              عملية استماع أو تحميل أو شراء تتم عبر منصات خارجية.
            </p>
          </section>

          <section>
            <h2 className="text-gold font-bold text-xl mb-3">2. الملكية الفكرية</h2>
            <p>
              جميع أسماء الفنانين والأغاني والألبومات والشعارات والأغلفة
              والعلامات التجارية المعروضة هي ملك لأصحابها، ويأتي استخدامها
              لأغراض التعريف بالمحتوى فقط، ولا يعني ذلك وجود أي شراكة أو تأييد
              من تلك الجهات ما لم يُذكر صراحة.
            </p>
          </section>

          <section>
            <h2 className="text-gold font-bold text-xl mb-3">3. الروابط الخارجية</h2>
            <p>
              تحتوي المنصة على روابط تؤدي إلى خدمات خارجية مثل YouTube وSpotify
              وApple Music وDeezer وغيرها، ولا تتحمل RoadX أي مسؤولية عن محتوى
              تلك المواقع أو سياسات الخصوصية الخاصة بها أو مدى توفر خدماتها.
            </p>
          </section>

          <section>
            <h2 className="text-gold font-bold text-xl mb-3">4. دقة البيانات</h2>
            <p>
              تعتمد بعض المعلومات المعروضة، مثل تواريخ الإصدار وعدد المتابعين
              ومؤشرات الرواج، على واجهات برمجية وخدمات خارجية، لذلك قد تتأخر
              البيانات أو تختلف عن الواقع، ولا تضمن المنصة تحديثها اللحظي أو
              دقتها الكاملة.
            </p>
          </section>

          <section>
            <h2 className="text-gold font-bold text-xl mb-3">5. سياسة الخصوصية</h2>
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
            <h2 className="text-gold font-bold text-xl mb-3">6. الاستخدام المقبول</h2>
            <p>
              يلتزم المستخدم بعدم استخدام المنصة لأي نشاط مخالف للقوانين أو
              محاولة استخراج بياناتها أو نسخها آلياً (Scraping) أو التأثير على
              عملها بأي وسيلة غير مصرح بها.
            </p>
          </section>

          <section>
            <h2 className="text-gold font-bold text-xl mb-3">7. حدود المسؤولية</h2>
            <p>
              بما أن RoadX تؤدي دور الوسيط في عرض المعلومات والروابط فقط،
              فإن الخدمة تُقدَّم كما هي دون أي ضمانات صريحة أو ضمنية، ولا تتحمل
              المنصة أي مسؤولية عن أي خسائر أو أضرار قد تنشأ نتيجة استخدام
              الخدمات أو المواقع الخارجية.
            </p>
          </section>

          <section>
            <h2 className="text-gold font-bold text-xl mb-3">8. طلبات إزالة المحتوى</h2>
            <p>
              إذا كنت مالكاً لحقوق نشر أو حقوق ملكية فكرية، وترى أن أحد
              العناصر المعروضة يخالف حقوقك، يرجى التواصل معنا عبر صفحة{" "}
              <a href="/contact" className="text-gold hover:underline font-bold">
                تواصل معنا
              </a>
              ، وسنعمل على مراجعة الطلب واتخاذ الإجراء المناسب في أقرب وقت ممكن.
            </p>
          </section>

          <section>
            <h2 className="text-gold font-bold text-xl mb-3">9. التعديلات</h2>
            <p>
              تحتفظ RoadX بحق تعديل هذه السياسة أو شروط الاستخدام في أي وقت،
              ويُعد استمرار استخدام المنصة بعد نشر أي تحديث موافقةً على النسخة
              المعدلة.
            </p>
          </section>

          <div className="border-t border-gold/25 pt-5 text-xs text-muted-foreground">
            آخر تحديث: يوليو 2026
          </div>

        </div>
      </div>
    </div>
  );
}
