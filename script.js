// 웹페이지가 완전히 로드되면 아래 코드를 실행합니다
// (즉, HTML이 모두 준비된 후에 동작합니다)
document.addEventListener('DOMContentLoaded', function() {
    // Firebase와 Firestore를 사용하기 위한 설정입니다
    // (이 부분은 Firebase 콘솔에서 받은 정보로 바꿔야 합니다)
    const firebaseConfig = {
        apiKey: "AIzaSyDZ02gI9wjTwuVRGhYOXAWqMVoaADMYk0U", // 내 프로젝트의 API 키
        authDomain: "memopjt.firebaseapp.com", // 인증 도메인
        projectId: "memopjt", // 프로젝트 ID
        storageBucket: "memopjt.firebasestorage.app", // 스토리지 버킷(파일 저장용)
        messagingSenderId: "123312917810", // 메시지 발신자 ID
        appId: "1:123312917810:web:3ce89cb1a159c971139b2b" // 앱 ID
    };
    // Firebase를 내 웹페이지에 연결합니다
    firebase.initializeApp(firebaseConfig);
    // Firestore 데이터베이스를 사용하겠다고 선언합니다
    const db = firebase.firestore();
    // 'memos'라는 이름의 컬렉션(메모 모음)을 사용합니다
    const memosRef = db.collection('memos');

    // HTML에서 입력창, 버튼, 메모리스트 영역을 가져옵니다
    const memoInput = document.getElementById('memoInput'); // 메모 입력창
    const addMemoBtn = document.getElementById('addMemoBtn'); // 입력 버튼
    const memoList = document.getElementById('memoList'); // 메모가 보여질 곳

    // ====== [카테고리 선택 및 추가 기능] ======
    const sidebarList = document.querySelector('.sidebar-list');
    let currentCategory = '전체 메모'; // 현재 선택된 카테고리(기본값: 전체 메모)

    // 각 카테고리 항목(li)을 클릭하면 'active' 클래스를 옮기고, 해당 카테고리 메모만 보여줌
    sidebarList.addEventListener('click', function(e) {
        if (e.target.tagName === 'LI') {
            Array.from(sidebarList.children).forEach(li => li.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.textContent.trim();
            showMemosByCategory(); // 카테고리별 메모 보여주기
        }
    });

    // '새 카테고리' 버튼을 클릭하면 새 카테고리 추가
    const addCategoryBtn = document.querySelector('.sidebar-add');
    addCategoryBtn.addEventListener('click', function() {
        const newCategory = prompt('새 카테고리 이름을 입력하세요:');
        if (newCategory && newCategory.trim()) {
            const li = document.createElement('li');
            li.textContent = newCategory.trim();
            sidebarList.appendChild(li);
        }
    });

    // ====== [카테고리별 메모 실시간 표시] ======
    let unsubscribe = null; // Firestore 실시간 구독 해제용 변수
    function showMemosByCategory() {
        // 기존 실시간 구독 해제
        if (unsubscribe) unsubscribe();
        // "전체 메모"면 모든 메모, 아니면 해당 카테고리 메모만 불러오기
        if (currentCategory.trim() === '전체 메모') {
            unsubscribe = memosRef.orderBy('created', 'desc').onSnapshot(renderMemos);
        } else {
            unsubscribe = memosRef.where('category', '==', currentCategory.trim()).orderBy('created', 'desc').onSnapshot(renderMemos);
        }
    }
    // 메모들을 화면에 그려주는 함수
    function renderMemos(snapshot) {
        memoList.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const memoItem = document.createElement('div');
            memoItem.className = 'memo-item';
            const memoContent = document.createElement('p');
            memoContent.textContent = data.text;
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.onclick = () => memosRef.doc(doc.id).delete();
            memoItem.appendChild(memoContent);
            memoItem.appendChild(deleteBtn);
            memoList.appendChild(memoItem);
        });
    }
    // 처음 페이지가 열릴 때 전체 메모를 보여줌
    showMemosByCategory();

    // ====== [메모 추가] ======
    addMemoBtn.onclick = addMemo;
    memoInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addMemo();
        }
    });
    function addMemo() {
        const text = memoInput.value.trim();
        if (!text) return;
        // 메모를 저장할 때 현재 카테고리 정보도 함께 저장
        // 단, "전체 메모"일 때는 "기타"로 저장
        let categoryToSave = currentCategory.trim() === '전체 메모' ? '기타' : currentCategory.trim();
        memosRef.add({ text, category: categoryToSave, created: firebase.firestore.FieldValue.serverTimestamp() });
        memoInput.value = '';
    }
});
