'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Edit3,
  GraduationCap,
  Info,
  Pencil,
  RotateCcw,
  Save,
  Search,
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  X,
  Compass,
  Lightbulb,
  Wrench,
} from 'lucide-react';
import { courseService } from '@/features/courses/services/course.service';
import type { Course } from '@/features/courses/types/course.types';
import { getErrorMessage } from '@/lib/errors';
import {
  aiTutorConfigService,
  DEFAULT_AI_TUTOR_CONFIG,
  type SocraticMode,
} from '../services/ai-tutor-config.service';
import { Button } from '@/components/ui/button';

// Specialized Prompt Templates per Course Subject (Post-Exam Diagnostic & Remediation)
const SUBJECT_TEMPLATES: Record<string, { label: string; prompt: string }> = {
  PRF: {
    label: 'Ngôn ngữ C (PRF192)',
    prompt:
      '# CHỈ THỊ HỆ THỐNG: TRỢ GIẢNG AI CHUYÊN SÂU LẬP TRÌNH C (PRF192 - ĐẠI HỌC FPT)\n\n' +
      '## 1. VAI TRÒ & NGUYÊN TẮC SƯ PHẠM\n' +
      '- Bạn là Trợ giảng AI Cấp cao chuyên trách môn Lập trình C (PRF192) tại Đại học FPT.\n' +
      '- Nhiệm vụ: Hỗ trợ sinh viên sau khi có kết quả chấm điểm thực hành (Practical Exam - PE). Mỗi câu hỏi (Q1 -> Q10) là 1 file .c độc lập có hàm main() riêng. Hãy giúp sinh viên sửa đúng testcase trượt và hiểu sâu bản chất ngôn ngữ C.\n' +
      '- Tuyệt đối tuân thủ 3 bước sư phạm:\n' +
      '  1. [Chỉ điểm chính xác]: Xác định câu hỏi nào đang bị sai (Q1 đến Q10), testcase trượt, so sánh giá trị kỳ vọng (Expected Output) vs kết quả thực tế (Actual Output).\n' +
      '  2. [Phân tích nguyên nhân gốc rễ (RCA)]: Chỉ rõ lỗi cú pháp, ép kiểu, định dạng xuất hoặc lỗi quản lý bộ nhớ.\n' +
      '  3. [Giải pháp & Code mẫu chuẩn]: Cung cấp đoạn code C hoàn chỉnh chuẩn mực, giải thích ngắn gọn tư duy giải quyết.\n\n' +
      '## 2. CẠM BẪY & QUY CHUẨN ĐẶC THÙ PRF192 TẠI ĐẠI HỌC FPT\n' +
      'Hãy rà soát kỹ các cạm bẫy kinh điển sau:\n\n' +
      '### Phép tính & Ép kiểu số học (Q1, Q2)\n' +
      '- Lỗi chia nguyên: int a = 5, b = 2; float c = a / b; -> ra 2.0 thay vì 2.5. Bắt buộc ép kiểu: (double)a / b hoặc (float)a / b.\n' +
      '- Làm tròn và định dạng printf: Đề yêu cầu %.2f thì không in %.0f hay %lf. Chú ý không in thừa hoặc thiếu ký tự \\n xuống dòng.\n\n' +
      '### Vòng lặp & Vẽ hình (Q2, Q3)\n' +
      '- Lỗi điều kiện dừng vòng lặp (Off-by-one): Chú ý <= vs < khiến vòng lặp chạy thừa/thiếu 1 lần.\n' +
      '- Vẽ hình bằng ký tự: Kiểm tra số khoảng trắng trước và sau ký tự sao (*), số dòng, xuống dòng đúng vị trí.\n\n' +
      '### Mảng 1 chiều & Sắp xếp (Q4, Q5)\n' +
      '- Truy cập ngoài biên mảng (Out of bounds): Mảng khai báo a[100] nhưng duyệt for (i = 0; i <= n; i++) -> Gây Undefined Behavior hoặc Segfault (Exit Code 139).\n' +
      '- Thứ tự sắp xếp: Đề yêu cầu TĂNG DẦN nhưng viết GIẢM DẦN (hoặc ngược lại).\n' +
      '- Chèn/xóa phần tử: Phải dịch chuyển các phần tử và cập nhật lại số lượng phần tử n.\n\n' +
      '### Chuỗi ký tự (String / Char array) (Q6, Q7)\n' +
      '- Tuyệt đối KHÔNG dùng gets() vì nguy cơ tràn bộ đệm. Khuyên dùng fgets(str, sizeof(str), stdin) và xóa ký tự \\n cuối: str[strcspn(str, "\\n")] = 0;\n' +
      '- Lỗi trôi lệnh nhập chuỗi sau khi scanf("%d"): Phải dọn sạch bộ nhớ đệm while ((getchar()) != \'\\n\'); trước khi nhập chuỗi.\n' +
      '- So sánh chuỗi: Bắt buộc dùng strcmp(s1, s2) == 0, không được dùng s1 == s2.\n' +
      '- Chuẩn hóa chuỗi: Xử lý khoảng trắng thừa ở đầu, cuối và giữa các từ; hoa/thường (toupper, tolower).\n\n' +
      '### Con trỏ & Hàm (Pointers & Functions) (Q8)\n' +
      '- Truyền tham chiếu: Muốn hoán vị (swap) hoặc thay đổi giá trị của biến ngoài hàm thì phải truyền con trỏ (int *a, int *b) và giải tham chiếu (*a = ...).\n' +
      '- Cảnh báo lỗi giải tham chiếu con trỏ NULL hoặc con trỏ chưa được khởi tạo.\n\n' +
      '### Ma trận & Cấu trúc Struct (Q9, Q10)\n' +
      '- Mảng 2 chiều: Chú ý chỉ số dòng/cột a[i][j].\n' +
      '- Struct: Khai báo đúng kiểu, nhập xuất thuộc tính bằng toán tử chấm . hoặc mũi tên -> nếu là con trỏ struct.\n\n' +
      '## 3. PHONG CÁCH PHẢN HỒI\n' +
      '- Ngắn gọn, chuyên nghiệp, sư phạm, tôn trọng.\n' +
      '- Định dạng code bằng markdown block ```c rõ ràng, làm nổi bật chỗ cần sửa.',
  },
  PRO: {
    label: 'Ngôn ngữ Java / OOP (PRO192)',
    prompt:
      '# CHỈ THỊ HỆ THỐNG: TRỢ GIẢNG AI CHUYÊN SÂU LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG JAVA (PRO192 - ĐẠI HỌC FPT)\n\n' +
      '## 1. VAI TRÒ & NGUYÊN TẮC SƯ PHẠM\n' +
      '- Bạn là Trợ giảng AI Cấp cao chuyên trách môn PRO192 (Java OOP) tại Đại học FPT.\n' +
      '- Nhiệm vụ cốt lõi: Hỗ trợ sinh viên sau khi có kết quả chấm điểm thực hành (Practical Exam - PE). Giúp sinh viên hiểu sâu bản chất lỗi, sửa trúng testcase trượt và nắm vững 4 trụ cột OOP (Đóng gói, Kế thừa, Đa hình, Trừu tượng).\n' +
      '- Quy trình giải đáp bắt buộc theo 3 bước:\n' +
      '  1. Chỉ điểm chính xác: Xác định rõ hàm đang sai (f1, f2, f3, tc1, tc2...), testcase trượt, và so sánh Expected Output vs Actual Output.\n' +
      '  2. Phân tích nguyên nhân gốc rễ (RCA): Giải thích cặn kẽ tại sao code bị sai (vi phạm logic, cạm bẫy cú pháp hay ngoại lệ runtime).\n' +
      '  3. Giải pháp & Code mẫu chuẩn: Cung cấp đoạn code sửa chuẩn Clean Code, tuân thủ Java Naming Conventions, tối ưu và có chú thích rõ ràng.\n\n' +
      '## 2. CẠM BẪY & QUY CHUẨN ĐẶC THÙ PRO192 TẠI ĐẠI HỌC FPT\n' +
      'Khi phân tích bài làm của sinh viên, hãy kiểm tra nghiêm ngặt các lỗi kinh điển sau:\n\n' +
      '### Câu 1: Lớp cơ bản & Đóng gói (Encapsulation)\n' +
      '- Thuộc tính bắt buộc private. Phương thức getter/setter phải đúng chuẩn camelCase (ví dụ: getName, setPrice).\n' +
      '- Phải có đủ 2 constructors: Constructor mặc định (no-argument) và Constructor đầy đủ tham số.\n' +
      '- Tuyệt đối không tự ý in (System.out.print) bên trong getter/setter.\n\n' +
      '### Câu 2: Kế thừa (Inheritance) & Ghi đè (Polymorphism)\n' +
      '- Lớp con dùng từ khóa extends, dòng đầu tiên trong constructor lớp con bắt buộc gọi super(...).\n' +
      '- Phương thức ghi đè phải có chú thích @Override.\n' +
      '- Lỗi sai định dạng toString(): Kiểm tra từng ký tự, dấu phẩy, khoảng trắng, chữ hoa/thường. Khuyên dùng String.format() để xuất đúng mẫu đề bài.\n\n' +
      '### Câu 3: Collections Framework & Interface (List, ArrayList, Comparator)\n' +
      '- Lớp xử lý phải implements interface được yêu cầu (như ICar, ISpec...).\n' +
      '- Hàm f1 (Đếm/Tìm kiếm): Phải kiểm tra danh sách rỗng (isEmpty) trước khi tìm max/min để tránh lỗi logic hoặc IndexOutOfBoundsException.\n' +
      '- Hàm f2 (Sắp xếp): Sử dụng Collections.sort với Comparator tùy biến hoặc Lambda (a, b) -> ... Kiểm tra kỹ chiều sắp xếp (tăng dần: o1.getVal() - o2.getVal(), giảm dần: ngược lại) và điều kiện sắp xếp phụ khi tiêu chí chính bằng nhau.\n' +
      '- Hàm f3 (Thay đổi / Xóa phần tử):\n' +
      '  * CẢNH BÁO NGUY HIỂM: Lỗi xóa phần tử trong vòng lặp xuôi for (int i = 0; i < list.size(); i++) khiến index bị nhảy cóc và bỏ sót phần tử kế tiếp!\n' +
      '  * Hướng dẫn sinh viên dùng vòng lặp đếm lùi for (int i = list.size() - 1; i >= 0; i--) hoặc Iterator.remove().\n\n' +
      '### Câu 4: Xử lý chuỗi (String Manipulation) & Regex\n' +
      '- Tuyệt đối cấm so sánh chuỗi bằng == (so sánh tham chiếu vùng nhớ). Bắt buộc dùng .equals() hoặc .equalsIgnoreCase().\n' +
      '- Tách từ: Khuyên dùng s.split("\\s+") để xử lý chuỗi có nhiều khoảng trắng liên tiếp thay vì chỉ split(" ").\n' +
      '- Cắt khoảng trắng đầu cuối bằng .trim() trước khi xử lý.\n\n' +
      '## 3. PHÒNG NGỪA CÁC LỖI RUNTIME KINH ĐIỂN\n' +
      '- NullPointerException: Kiểm tra object != null trước khi gọi phương thức.\n' +
      '- StringIndexOutOfBoundsException: Luôn kiểm tra độ dài chuỗi trước khi dùng .charAt() hoặc .substring().\n' +
      '- Lỗi trôi lệnh Scanner: Dùng sc.nextLine() sau khi đọc số để dọn bộ đệm.\n\n' +
      '## 4. PHONG CÁCH PHẢN HỒI\n' +
      '- Ngắn gọn, chuyên nghiệp, sư phạm, tôn trọng và truyền cảm hứng học tập.\n' +
      '- Định dạng code bằng markdown block ```java rõ ràng, làm nổi bật chỗ cần sửa.',
  },
  CSD: {
    label: 'Cấu trúc dữ liệu & Giải thuật (CSD201)',
    prompt:
      '# CHỈ THỊ HỆ THỐNG: TRỢ GIẢNG AI CHUYÊN SÂU CẤU TRÚC DỮ LIỆU & GIẢI THUẬT (CSD201 - ĐẠI HỌC FPT)\n\n' +
      '## 1. VAI TRÒ & NGUYÊN TẮC SƯ PHẠM\n' +
      '- Bạn là Trợ giảng AI Cấp cao chuyên trách môn CSD201 (Data Structures and Algorithms) tại Đại học FPT.\n' +
      '- Nhiệm vụ: Hỗ trợ sinh viên sau khi có kết quả chấm điểm thực hành (PE). Đề thi CSD201 gồm 3 bài toán lớn (Q1: Danh sách liên kết, Q2: Cây nhị phân tìm kiếm, Q3: Đồ thị). Mỗi câu có các hàm f1, f2, f3, f4 xuất kết quả ra file txt.\n' +
      '- Phương pháp giải đáp 3 bước bắt buộc:\n' +
      '  1. [Chỉ điểm chính xác]: Xác định rõ câu nào (Q1, Q2, Q3) và hàm nào (f1, f2, f3, f4) đang trượt testcase, so sánh Expected Output vs Actual Output trong file kết quả.\n' +
      '  2. [Phân tích nguyên nhân gốc rễ (RCA)]: Giải thích chi tiết lỗi thao tác con trỏ/tham chiếu, điều kiện dừng đệ quy, hay sai lệch thuật toán.\n' +
      '  3. [Giải pháp & Code mẫu chuẩn]: Cung cấp đoạn code thuật toán hoàn chỉnh, chuẩn mực, tối ưu độ phức tạp và có giải thích từng bước.\n\n' +
      '## 2. CẠM BẪY & QUY CHUẨN ĐẶC THÙ CSD201 TẠI ĐẠI HỌC FPT\n' +
      'Hãy rà soát kỹ các cạm bẫy cấu trúc dữ liệu kinh điển sau:\n\n' +
      '### Câu 1: Danh sách liên kết (Singly / Doubly Linked List - MyList)\n' +
      '- Thêm node (addFirst, addLast): Phải cập nhật cả head và tail. Khi danh sách đang rỗng (head == null), thêm node mới thì head = tail = newNode.\n' +
      '- Xóa node (removeFirst, remove, removeAfter):\n' +
      '  * Phải kiểm tra danh sách rỗng hoặc danh sách chỉ có 1 phần tử.\n' +
      '  * Khi xóa phần tử cuối: Bắt buộc cập nhật lại tail trỏ về node liền trước.\n' +
      '  * Cẩn thận mất liên kết: Phải giữ tham chiếu node kế tiếp trước khi thay đổi current.next.\n' +
      '- Đảo ngược danh sách (reverse): Cập nhật lại head thành node cuối và tail thành node đầu.\n' +
      '- Sắp xếp (sort): Thường dùng Selection Sort hoặc Bubble Sort đổi giá trị (data/info) giữa các node thay vì đổi con trỏ để tránh đứt gãy cấu trúc.\n\n' +
      '### Câu 2: Cây nhị phân tìm kiếm (Binary Search Tree - BSTree)\n' +
      '- Duyệt cây (Traversals):\n' +
      '  * In-order (Trái - Gốc - Phải): Xuất các phần tử theo thứ tự tăng dần.\n' +
      '  * Pre-order (Gốc - Trái - Phải), Post-order (Trái - Phải - Gốc).\n' +
      '  * Breadth-First Search (BFS): Bắt buộc dùng Hàng đợi (Queue). Lấy node cha ra, thêm con trái rồi đến con phải vào hàng đợi.\n' +
      '- Điều kiện dừng đệ quy: Luôn kiểm tra if (p == null) return; ở đầu hàm đệ quy để tránh StackOverflowError.\n' +
      '- Xóa node (delete):\n' +
      '  * Node lá (0 con): Cho con trỏ cha trỏ về null.\n' +
      '  * Node 1 con: Nối trực tiếp cha với con duy nhất của node cần xóa.\n' +
      '  * Node 2 con:\n' +
      '    + Delete by Copying: Tìm node cực phải của cây con trái (rightmost of left subtree) để lấy giá trị đè lên, rồi xóa node cực phải đó.\n' +
      '    + Delete by Merging: Nối cây con phải vào vị trí cực phải của cây con trái.\n' +
      '- Chiều cao cây (height): return 1 + Math.max(height(p.left), height(p.right)); với điều kiện cơ sở if (p == null) return 0;.\n\n' +
      '### Câu 3: Đồ thị (Graph Algorithms)\n' +
      '- Biểu diễn đồ thị: Ma trận kề (Adjacency Matrix a[i][j]).\n' +
      '- Duyệt đồ thị (BFS / DFS): Bắt buộc phải có mảng visited[] đánh dấu các đỉnh đã duyệt để chống vòng lặp vô tận.\n' +
      '- Thuật toán Dijkstra (Tìm đường đi ngắn nhất):\n' +
      '  * Khởi tạo mảng khoảng cách d[], mảng đỉnh trước p[], tập đỉnh đã chốt s[].\n' +
      '  * Luôn tìm đỉnh chưa xét có khoảng cách nhỏ nhất để relax các đỉnh kề.\n' +
      '  * Truy vết đường đi: Dùng Stack hoặc đệ quy để in đường đi theo đúng chiều từ đỉnh xuất phát đến đỉnh đích.\n' +
      '- Thuật toán Prim / Kruskal (Cây khung nhỏ nhất - MST): Đảm bảo không tạo chu trình khi kết nạp cạnh.\n\n' +
      '## 3. PHÒNG NGỪA NGOẠI LỆ & HIỆU NĂNG\n' +
      '- NullPointerException: Kiểm tra node != null trước khi truy cập node.info, node.next, node.left, node.right.\n' +
      '- Time Limit Exceeded (TLE): Thuật toán đệ quy không có memoization hoặc duyệt lặp vô tận khiến sandbox bị timeout (quá thời gian quy định).\n\n' +
      '## 4. PHONG CÁCH PHẢN HỒI\n' +
      '- Sư phạm, mạch lạc, giải thích trực quan từng bước biến đổi của con trỏ / cây / đồ thị.\n' +
      '- Định dạng code bằng markdown block ```java chuẩn mực, kèm chú thích tại các bước mấu chốt.',
  },
  DEFAULT: {
    label: 'Chuẩn Học tập FPT (Chung)',
    prompt:
      'Bạn là Trợ giảng AI Học tập Toàn diện của hệ thống AITA tại Đại học FPT.\n' +
      '- Sứ mệnh: Giúp sinh viên hiểu sâu lý do bị trừ điểm, chỉ rõ testcase nào bị Fail và hướng dẫn giải pháp sửa đúng.\n' +
      '- Luôn tuân thủ quy trình 3 bước: Soi lỗi testcase -> Phân tích nguyên nhân kỹ thuật -> Hướng dẫn giải pháp & Code mẫu chuẩn.\n' +
      '- Khuyến khích tinh thần học tập cầu tiến và chia sẻ mẹo viết Clean Code.',
  },
};

export function AiTutorConfigPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string>('');
  const [searchCourse, setSearchCourse] = useState('');
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // View vs Edit Mode State
  const [isEditing, setIsEditing] = useState(false);

  // Form State for Active Course
  const [socraticMode] = useState<SocraticMode>('BALANCED');
  const [customPrompt, setCustomPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [enableContext, setEnableContext] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // Snapshot of saved data for Cancel / Restore
  const [savedSnapshot, setSavedSnapshot] = useState<{
    customPrompt: string;
    temperature: number;
    enableContext: boolean;
  }>({
    customPrompt: '',
    temperature: 0.7,
    enableContext: true,
  });

  // Load all lecturer courses
  useEffect(() => {
    let cancelled = false;
    setIsLoadingCourses(true);
    setErrorMessage(null);

    courseService
      .getCourses()
      .then((loaded) => {
        if (cancelled) return;
        setCourses(loaded);
        if (loaded.length > 0) {
          setActiveCourseId((prev) => prev || loaded[0]!.id);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setErrorMessage(getErrorMessage(err, 'Không tải được danh sách khóa học của bạn.'));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCourses(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Active course object
  const activeCourse = useMemo(() => {
    return courses.find((c) => c.id === activeCourseId) ?? null;
  }, [courses, activeCourseId]);

  // Filtered courses by search query
  const filteredCourses = useMemo(() => {
    if (!searchCourse.trim()) return courses;
    const q = searchCourse.toLowerCase();
    return courses.filter(
      (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    );
  }, [courses, searchCourse]);

  // Load AI Tutor config whenever active course changes
  useEffect(() => {
    if (!activeCourseId) return;

    let cancelled = false;
    setIsLoadingConfig(true);
    setErrorMessage(null);
    setIsEditing(false); // Default to Locked / View Mode on course switch

    aiTutorConfigService
      .get(activeCourseId)
      .then((config) => {
        if (cancelled) return;
        const loadedPrompt = config.customPrompt || '';
        const loadedTemp = config.temperature ?? 0.7;
        const loadedContext = config.enableContext ?? true;

        setCustomPrompt(loadedPrompt);
        setTemperature(loadedTemp);
        setEnableContext(loadedContext);
        setUpdatedAt(config.updatedAt || null);

        setSavedSnapshot({
          customPrompt: loadedPrompt,
          temperature: loadedTemp,
          enableContext: loadedContext,
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setErrorMessage(getErrorMessage(err, 'Không tải được cấu hình AI Tutor của khóa học này.'));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingConfig(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCourseId]);

  // Handle Save
  const handleSave = async () => {
    if (!activeCourseId) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const saved = await aiTutorConfigService.save(activeCourseId, {
        socraticMode: 'BALANCED',
        customPrompt,
        temperature,
        enableContext,
      });

      const newUpdatedAt = saved.updatedAt || new Date().toISOString();
      setUpdatedAt(newUpdatedAt);
      setSavedSnapshot({
        customPrompt,
        temperature,
        enableContext,
      });
      setIsEditing(false); // Return to View Mode
      setSuccessToast(`Đã lưu cấu hình Trợ giảng AI cho môn ${activeCourse?.code || ''} thành công!`);
      window.setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, 'Không lưu được cấu hình Trợ giảng AI.'));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Cancel Edit
  const handleCancelEdit = () => {
    setCustomPrompt(savedSnapshot.customPrompt);
    setTemperature(savedSnapshot.temperature);
    setEnableContext(savedSnapshot.enableContext);
    setIsEditing(false);
  };

  // Handle Reset to Default in Edit Mode
  const handleResetDefault = () => {
    setCustomPrompt(DEFAULT_AI_TUTOR_CONFIG.customPrompt);
    setTemperature(DEFAULT_AI_TUTOR_CONFIG.temperature);
    setEnableContext(DEFAULT_AI_TUTOR_CONFIG.enableContext);
  };

  // Apply Template based on course code
  const handleApplyTemplate = (key: string) => {
    const tmpl = SUBJECT_TEMPLATES[key];
    if (tmpl) {
      setCustomPrompt(tmpl.prompt);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-100 overflow-hidden">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="border-b border-slate-200/80 bg-white px-6 py-4 shadow-2xs shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20">
              <Bot className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900">Quản lý Cấu hình Trợ giảng AI Theo Môn Học</h1>
                <span className="rounded-full bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 text-2xs font-bold text-indigo-700">
                  All-in-One Learning Tutor
                </span>
              </div>
              <p className="text-xs text-slate-500">
                AI hỗ trợ sinh viên sau khi có điểm: soi lỗi testcase trượt, phân tích nguyên nhân và hướng dẫn giải pháp học tập.
              </p>
            </div>
          </div>

          {activeCourse && (
            <div className="flex items-center gap-2">
              {!isEditing ? (
                /* View Mode Actions */
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  disabled={isLoadingConfig}
                  className="h-9 gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm px-4.5"
                >
                  <Pencil className="size-3.5" />
                  <span>Chỉnh sửa cấu hình ({activeCourse.code})</span>
                </Button>
              ) : (
                /* Edit Mode Actions */
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="h-9 gap-1.5 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <X className="size-3.5 text-slate-500" />
                    <span>Hủy</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetDefault}
                    disabled={isSaving}
                    className="h-9 gap-1.5 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <RotateCcw className="size-3.5 text-slate-500" />
                    <span>Khôi phục mặc định</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-9 gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm px-4.5"
                  >
                    <Save className="size-3.5" />
                    <span>{isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}</span>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Master Column: Course Selector List */}
        <aside className="w-80 md:w-88 border-r border-slate-200/80 bg-white flex flex-col shrink-0">
          {/* Search Bar */}
          <div className="p-3.5 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mã hoặc tên môn học..."
                value={searchCourse}
                onChange={(e) => setSearchCourse(e.target.value)}
                className="w-full h-8.5 rounded-xl border border-slate-200 bg-slate-50/70 pl-8.5 pr-3 text-xs text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Courses List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {isLoadingCourses ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 p-3" />
              ))
            ) : filteredCourses.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                Không tìm thấy môn học nào phù hợp.
              </div>
            ) : (
              filteredCourses.map((c) => {
                const isActive = c.id === activeCourseId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      if (isEditing && !window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn chuyển môn học khác?')) {
                        return;
                      }
                      setActiveCourseId(c.id);
                    }}
                    className={`w-full text-left rounded-xl p-3 transition-all border ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-50/80 shadow-2xs'
                        : 'border-transparent bg-white hover:bg-slate-50/90 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-mono text-2xs font-extrabold px-2 py-0.5 rounded-md ${
                          isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.code}
                      </span>
                      <span className="text-3xs text-slate-400 font-medium">
                        {c.semester || 'Học kỳ Fall 2026'}
                      </span>
                    </div>

                    <h4
                      className={`mt-1.5 text-xs font-bold line-clamp-1 ${
                        isActive ? 'text-indigo-950' : 'text-slate-800'
                      }`}
                    >
                      {c.name}
                    </h4>

                    <div className="mt-1 flex items-center justify-between text-3xs text-slate-400">
                      <span>{c.enrollmentCount ?? 0} sinh viên</span>
                      <span>•</span>
                      <span>{c.assignmentCount ?? 0} bài tập/đề thi</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Detail Column: Course AI Configuration Studio */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center gap-2.5">
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!activeCourse ? (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-400 text-xs">
              <BookOpen className="size-10 text-slate-300" />
              <p className="font-semibold text-slate-600">Chọn một môn học ở danh sách bên trái để cấu hình Trợ giảng AI</p>
            </div>
          ) : isLoadingConfig ? (
            <div className="space-y-4">
              <div className="h-28 animate-pulse rounded-2xl bg-white border border-slate-200" />
              <div className="h-64 animate-pulse rounded-2xl bg-white border border-slate-200" />
            </div>
          ) : !isEditing ? (
            /* ========================================================= */
            /* VIEW / LOCKED MODE: Clean, clear summary of saved policy  */
            /* ========================================================= */
            <div className="space-y-6">
              {/* Active Course Status Banner */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-elevated-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700">
                      <GraduationCap className="size-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-base font-extrabold text-slate-900">
                          {activeCourse.code} — {activeCourse.name}
                        </h2>
                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-2xs font-bold text-emerald-700">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Đã lưu &amp; Đang kích hoạt
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activeCourse.enrollmentCount ?? 0} sinh viên • {activeCourse.assignmentCount ?? 0} bài tập trong khóa học
                        {updatedAt && (
                          <span className="ml-2 text-slate-400">
                            • Cập nhật lần cuối: {new Date(updatedAt).toLocaleString('vi-VN')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-sm px-4"
                  >
                    <Edit3 className="size-3.5" />
                    <span>Chỉnh sửa cấu hình</span>
                  </Button>
                </div>
              </div>

              {/* Summary Card 1: All-in-One Learning Mission */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-elevated-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4.5 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      1. Cơ chế Trợ giảng Học tập &amp; Chẩn đoán Lỗi Toàn diện
                    </h3>
                  </div>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-2xs font-bold text-emerald-700">
                    Quy trình 3-trong-1 tự động
                  </span>
                </div>

                <div className="rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/60 via-slate-50/40 to-emerald-50/40 p-4.5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-black text-xs">
                        3in1
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900">
                        Phân Tích Lỗi Sai, Chỉ Điểm Và Hướng Dẫn Khắc Phục Sau Thi
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Để phục vụ mục tiêu học hỏi từ sai lầm, AI đồng hành cùng sinh viên qua quy trình chuẩn 3 bước trong mỗi câu hỏi:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                          <Compass className="size-3.5" />
                          <span>Bước 1: Soi lỗi</span>
                        </div>
                        <p className="text-2xs text-slate-600 leading-relaxed">
                          Chỉ rõ testcase nào bị Fail, so sánh Expected vs Actual, và định vị đúng dòng code gây lỗi.
                        </p>
                      </div>

                      <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs">
                          <Lightbulb className="size-3.5" />
                          <span>Bước 2: Bản chất</span>
                        </div>
                        <p className="text-2xs text-slate-600 leading-relaxed">
                          Giải thích tại sao logic đó sai (chia nguyên làm tròn, lệch format printf, tràn mảng, lỗi con trỏ).
                        </p>
                      </div>

                      <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                          <Wrench className="size-3.5" />
                          <span>Bước 3: Khắc phục</span>
                        </div>
                        <p className="text-2xs text-slate-600 leading-relaxed">
                          Cung cấp đoạn code sửa chuẩn, giải thích cách sửa và hướng dẫn viết Clean Code tối ưu.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Card 2: Custom System Prompt */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-elevated-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="size-4.5 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      2. Chỉ Thị Dặn Dò Riêng Của Giảng Viên Cho Môn Này
                    </h3>
                  </div>
                  <span className="text-2xs font-semibold text-slate-500 font-mono">
                    {savedSnapshot.customPrompt.length > 0
                      ? `${savedSnapshot.customPrompt.length} ký tự`
                      : 'Mặc định FPT'}
                  </span>
                </div>

                {savedSnapshot.customPrompt.trim().length > 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {savedSnapshot.customPrompt}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-500 flex items-center gap-2">
                    <Info className="size-4 text-slate-400 shrink-0" />
                    <span>
                      Môn học này đang áp dụng bộ quy chuẩn học tập FPT tiêu chuẩn. Giảng viên có thể bấm <strong>&quot;Chỉnh sửa cấu hình&quot;</strong> để thêm dặn dò riêng cho môn {activeCourse.code}.
                    </span>
                  </div>
                )}
              </div>

              {/* Summary Card 3: Parameters & Context */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-elevated-sm space-y-3.5">
                <div className="flex items-center gap-2">
                  <Sliders className="size-4.5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    3. Tham số mô hình &amp; Ngữ cảnh dữ liệu
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Context State Tile */}
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 space-y-1.5">
                    <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider">
                      Ngữ cảnh đề bài &amp; Rubric
                    </span>
                    <div className="flex items-center gap-2 pt-0.5">
                      {savedSnapshot.enableContext ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="size-3.5 text-emerald-600" />
                          Đang BẬT (Đọc đề, rubric &amp; code)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 border border-slate-300 px-3 py-1 text-xs font-bold text-slate-700">
                          <X className="size-3.5 text-slate-500" />
                          Đang TẮT (Chỉ hỗ trợ lý thuyết)
                        </span>
                      )}
                    </div>
                    <p className="text-2xs text-slate-500 leading-relaxed pt-1">
                      {savedSnapshot.enableContext
                        ? 'AI tự động đọc mã nguồn bài nộp và danh sách testcase bị trượt để chỉ ra chính xác từng dòng lỗi cho sinh viên.'
                        : 'AI chỉ đóng vai trò trợ giảng lý thuyết tổng quát mà không đọc mã nguồn bài nộp của sinh viên.'}
                    </p>
                  </div>

                  {/* Temperature Tile */}
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 space-y-1.5">
                    <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider">
                      Độ ngẫu nhiên (Temperature)
                    </span>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="rounded-lg bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 font-mono text-xs font-bold text-indigo-700">
                        {savedSnapshot.temperature.toFixed(2)}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {savedSnapshot.temperature <= 0.4
                          ? 'Tập trung, chính xác cao'
                          : savedSnapshot.temperature <= 0.7
                          ? 'Cân bằng & Gợi mở'
                          : 'Sáng tạo linh hoạt'}
                      </span>
                    </div>
                    <p className="text-2xs text-slate-500 leading-relaxed pt-1">
                      Quyết định mức độ nhất quán và phong phú trong các câu hỏi gợi ý và giải thích của AI cho sinh viên.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Edit Banner */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <BrainCircuit className="size-5 text-indigo-600 shrink-0" />
                  <p className="text-xs text-indigo-950 font-medium">
                    Muốn tùy biến thêm dặn dò riêng hoặc điều chỉnh nhiệt độ AI cho môn <strong>{activeCourse.code}</strong>?
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm shrink-0"
                >
                  <Pencil className="size-3.5 mr-1.5" />
                  Chỉnh sửa cấu hình
                </Button>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* EDIT MODE: Interactive studio form with Cancel/Save       */
            /* ========================================================= */
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Edit Mode Notice Banner */}
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 text-xs text-indigo-900 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Pencil className="size-4 shrink-0 text-indigo-600" />
                  <span>
                    Bạn đang ở <strong>Chế độ Chỉnh sửa</strong> cho môn <strong>{activeCourse.code}</strong>. Hãy tùy chỉnh dặn dò hoặc tham số và bấm <strong>&quot;Lưu cấu hình&quot;</strong> khi hoàn tất.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="h-8 rounded-lg border-slate-300 text-xs text-slate-700 bg-white hover:bg-slate-50"
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm"
                  >
                    <Save className="size-3.5 mr-1" />
                    {isSaving ? 'Đang lưu...' : 'Lưu lại'}
                  </Button>
                </div>
              </div>

              {/* Section 1: All-in-One Learning Mission (Active and Locked as Unified Rule) */}
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-elevated-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <GraduationCap className="size-4 text-indigo-600" />
                      1. Cơ chế Trợ giảng Học tập &amp; Chẩn đoán Lỗi Sau Thi (All-in-One)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Áp dụng thống nhất cho mọi sinh viên trong môn <strong className="text-slate-700">{activeCourse.code}</strong> khi xem lại bài thi sau khi có điểm.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-2xs font-bold text-emerald-700">
                    Kích hoạt mặc định
                  </span>
                </div>

                <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-md bg-indigo-600 text-white font-black text-2xs">
                      ✓
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">
                      Hợp nhất quy trình 3 bước: Soi lỗi $\rightarrow$ Bản chất $\rightarrow$ Khắc phục
                    </h3>
                  </div>
                  <p className="text-2xs text-slate-600 leading-relaxed">
                    AI sẽ tự động đọc bài làm và bộ testcases của sinh viên để chỉ ra đúng dòng lỗi, phân tích nguyên nhân tại sao trượt test và đưa ra đoạn code sửa chuẩn mực để sinh viên học tập tối đa.
                  </p>
                </div>
              </section>

              {/* Section 2: Custom System Prompt */}
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-elevated-sm space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Code2 className="size-4 text-indigo-600" />
                      2. Chỉ Thị Dặn Dò Riêng Của Giảng Viên (Tùy chọn)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Thêm các lưu ý đặc thù về cạm bẫy ngôn ngữ hoặc chuẩn Clean Code cho môn <strong className="text-slate-700">{activeCourse.code}</strong>.
                    </p>
                  </div>

                  {/* Quick Subject Templates */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-2xs font-semibold text-slate-400">Nạp nhanh mẫu:</span>
                    {Object.entries(SUBJECT_TEMPLATES).map(([key, t]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleApplyTemplate(key)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-2xs font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={8}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    maxLength={4000}
                    placeholder="Nhập dặn dò bổ sung cho AI (ví dụ: Chú ý nhắc sinh viên kiểm tra ép kiểu số thực trong PRF192, kiểm tra null trước khi gọi hàm trong Java...)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 font-mono text-xs leading-relaxed text-slate-900 shadow-inner outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600"
                  />
                  <div className="mt-1 flex items-center justify-between text-2xs text-slate-400">
                    <span>Hỗ trợ Markdown và cú pháp chỉ thị chuẩn Prompt Engineering.</span>
                    <span className="font-mono">{customPrompt.length} / 4.000 ký tự</span>
                  </div>
                </div>
              </section>

              {/* Section 3: Advanced Parameters */}
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-elevated-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="size-4 text-indigo-600" />
                  3. Tham số mô hình &amp; Công tắc ngữ cảnh
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                  {/* Context Toggle */}
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">Dùng ngữ cảnh đề bài &amp; rubric</span>
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-3xs font-bold text-emerald-700">Khuyên dùng</span>
                      </div>
                      <p className="text-2xs text-slate-500 leading-relaxed">
                        Cho phép AI tự động đọc đề thi, testcase và mã nguồn bài nộp để chỉ ra chính xác từng testcase bị trượt.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEnableContext(!enableContext)}
                      className="shrink-0 text-slate-700 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      {enableContext ? (
                        <ToggleRight className="size-8 text-indigo-600" />
                      ) : (
                        <ToggleLeft className="size-8 text-slate-400" />
                      )}
                    </button>
                  </div>

                  {/* Temperature Slider */}
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Độ ngẫu nhiên (Temperature):</span>
                      <span className="rounded-md bg-indigo-100 px-2 py-0.5 font-mono text-xs font-bold text-indigo-700">
                        {temperature.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={1.0}
                      step={0.05}
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full cursor-pointer accent-indigo-600"
                    />
                    <p className="text-2xs text-slate-500 leading-relaxed">
                      Giá trị thấp (0.2–0.5) giúp câu trả lời ổn định, bám sát rubric; giá trị cao (0.7–0.9) giúp AI giải thích sinh động và chi tiết hơn.
                    </p>
                  </div>
                </div>
              </section>

              {/* Bottom Action Bar in Edit Mode */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="rounded-xl border-slate-300 text-xs text-slate-700 hover:bg-slate-50 px-4"
                >
                  Hủy bỏ thay đổi
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm px-6"
                >
                  <Save className="size-3.5 mr-1.5" />
                  {isSaving ? 'Đang lưu...' : `Lưu cấu hình (${activeCourse.code})`}
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
