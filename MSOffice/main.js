    // 난이도 선택을 진행해 줄 seldiff
    const selDiff = document.getElementsByClassName('selectDifficulty');
    // mineIne안에 지뢰찾기 게임이 들어갈 것이다.
    const mineIn = document.getElementById('mineIn');
    // 남아있는 폭탄 개수를 보여줄 mineRemain -> 실제 폭탄 개수가 아니라, 내가 매핑해 준 지뢰의 개수
    const mineRemain = document.getElementById('mineRemain');
    // 난이도는 쉬움 ~ 어려움
    let difficulty = 0;

    // 지뢰 매설, 지뢰 찾기에 DFS로 사용될 xMove, yMove이다.
    // 참고로 0~3번 위치까지는 상하좌우, 4~7번 위치는 대각선이다.
    const xMove = [0, 0, 1, -1, 1, -1, -1, 1];
    const yMove = [1, -1, 0, 0, 1, -1, 1, -1];

    // 2차원 배열을 통해 지뢰찾기의 값들이 저장될 mineMao
    let mineMap;
    // 실제 전체 지뢰 갯수 wholeMine
    let wholeMine;
    // 매핑 가능 지뢰 개수
    let mappingMine;

    // 기초 init함수
    function init() {
      // click관련 eventListner추가
      // selDiff는 난이도 설정용이다. 즉 addEventListner를 사용하여 "click"이 감지되면 clickColor 함수를 진행시켜 준다.
      for (var i = 0; i < selDiff.length; i++) {
        selDiff[i].addEventListener("click", clickColor);
      }

      // 지뢰 클릭 시 -> 동적 바인딩
      // 지뢰는 처음에 html으로 설정되지 않고, function동작으로 만들어진다.
      // 이 지뢰에 addEventListener를 선언해 주기 위해 동적 바인딩을 진행해 준다.
      document.addEventListener('click', function(event) {
        if (event.target && event.target.className === "mineCheck mineCover") {
          // 현재 위치의 좌표를 받아서  find함수 진행하기
          var x = event.target.getAttribute("xLoc");
          var y = event.target.getAttribute("yLoc");
          find(x, y, 0);
        }
      });

      // 지뢰찾기 할때는 마우스 오른쪽키 눌렀을 때 contextmenu나오지 않게
      document.getElementById("mineIn").addEventListener(
        "contextmenu", event => event.preventDefault()
      );

      // 지뢰 매핑 함수
      // 마우스 오른쪽 키를 눌러 폭탄이 있는지, 모르겠는지, 되돌리기 를 진행하도록 한다.
      document.getElementById("mineIn").addEventListener(
        "mousedown", event => {
          if (event.button == 2) {
            var x = event.target.getAttribute("xLoc");
            var y = event.target.getAttribute("yLoc");
            mapping(x, y);
          }
        }
      );
    }

    // 난이도 선택 색상 변경 이벤트
    function clickColor(event) {
      if (difficulty != this.getAttribute("diff")) {
        if (confirm('해당 난이도로 게임을 구성하시겠습니까?')) {
          for (var i = 0; i < selDiff.length; i++) {
            var remover = selDiff[i].getAttribute("diff");
            selDiff[i].classList.remove(remover);
          }
          difficulty = this.getAttribute("diff");
          event.target.classList.add(difficulty);
          make(difficulty);
        }
      }
    }



    // 전체 폭탄찾기 관련 내용들을 만드는 make
    function make(choise) {
      var xFrame;
      var yFrame;
      switch (choise) {
        case 'easy':
          xFrame = 10;
          yFrame = 10;
          wholeMine = 41;
          break;
        case 'normal':
          xFrame = 15;
          yFrame = 15;
          wholeMine = 90;
          break;
        case 'hard':
          xFrame = 22;
          yFrame = 22;
          wholeMine = 195;
          break;
      }
      mappingMine = wholeMine;
      mineMap = Array.mineMaker(xFrame, yFrame, wholeMine); // mineMaker를 통해 이차원 배열 mineMap에 지뢰 매설 및 안전지대 땅 설정
      frameMaker(xFrame, yFrame, mineMap); // 껍데기 만들기 함수
    }

    // 껍데기 만들기
    function frameMaker(xFrame, yFrame) {

      var mineFrame = document.createElement("table");
      mineFrame.className = "mineFrame";

      for (var i = 0; i < xFrame; i++) {
        var tr = document.createElement("tr");
        for (var j = 0; j < yFrame; j++) {
          var td = document.createElement("td");
          td.setAttribute("xLoc", i);
          td.setAttribute("yLoc", j);
          td.id = (Number(i * xFrame) + Number(j));
          td.setAttribute("mineVal", mineMap[i][j]);
          td.className = "mineCheck";
          td.classList.add("mineCover");
          tr.append(td);
        }
        mineFrame.append(tr);
      }
      mineIn.innerText = "";
      mineIn.append(mineFrame);
      mineRemain.innerText = mappingMine;
    }

    // 이차원 배열 만들기 - 폭탄 만들기
    Array.mineMaker = function(m, n, boomb) {
      var a, mineMap = [];
      for (var i = 0; i < m; i++) {
        a = [];
        for (var j = 0; j < n; j++) {
          a[j] = 0;
        }
        mineMap[i] = a;
      } // 이차원 배열을 생성해준다.

      while (boomb > 0) { // 모든 지뢰가 매설될 때 까지
        var x = Math.floor((Math.random()) * m);
        var y = Math.floor((Math.random()) * n);
        if (mineMap[x][y] !== -1) { // 해당 위치가 지뢰가 아닐 때만
          boomb--; // 지뢰를 하나 매설했다.
          mineMap[x][y] = -1;
          for (var i = 0; i < 8; i++) {
            var xTo = x + xMove[i];
            var yTo = y + yMove[i];
            if (xTo < 0 || xTo >= m || yTo < 0 || yTo >= n) continue;
            if (mineMap[xTo][yTo] === -1) continue;
            mineMap[xTo][yTo]++;
          }
        }
      }
      return mineMap;
    };

    // 폭탄 클릭
    function find(x, y, dfs) {
      var xFrame = mineMap.length;
      var yFrame = mineMap[0].length;
      var nowLoc = document.getElementById(Number(x * xFrame) + Number(y));
      var nowCondition = nowLoc.textContent;

      if (nowCondition === "💣") {} else if (mineMap[x][y] >= 0) {
        if (mineMap[x][y] != 0) nowLoc.innerText = mineMap[x][y];
        mineMap[x][y] = -2; // 체크 완료하면 -2로 하여 다시 못보게
        nowLoc.classList.remove("mineCover");
        for (var i = 0; i < 4; i++) {
          var xTo = Number(x) + Number(xMove[i]);
          var yTo = Number(y) + Number(yMove[i]);
          if (xTo < 0 || xTo >= xFrame || yTo < 0 || yTo >= yFrame) continue;
          if (mineMap[xTo][yTo] === -1) continue;
          find(xTo, yTo, 1);
        }
      } else if (mineMap[x][y] === -1) {
        alert("펑~ GAME OVER~~~~~");
        mineIn.innerText = '';
        for (var i = 0; i < selDiff.length; i++) {
          var remover = selDiff[i].getAttribute("diff");
          selDiff[i].classList.remove(remover);
        }
        difficulty = 0;
        mineRemain.innerText = "";
      }
    }

    // 지뢰 매핑
    function mapping(x, y) {
      var xFrame = mineMap.length;
      var nowLoc = document.getElementById(Number(x * xFrame) + Number(y));
      var nowCondition = nowLoc.textContent;
      // wholeMine 전체 폭탄
      if (nowCondition === "💣") { // 폭탄 -> ? 로 변경
        if (mineMap[x][y] === -1) wholeMine++; // 지금 위치가 폭탄 매설 위치가 맞았다면 
        mappingMine++;
        nowLoc.innerText = "❓";
      } else if (nowCondition === "❓") { // ? -> 빈칸으로 변경
        nowLoc.innerText = "";
      } else if (nowCondition === "") { // 빈칸 -> 폭탄 매설
        if (mineMap[x][y] === -1) wholeMine--; // 지금 위치가 폭탄 매설 위치가 맞았다면
        mappingMine--;
        nowLoc.innerText = "💣";
      }
      mineRemain.innerText = mappingMine;
      if (wholeMine === 0 && mappingMine === 0) {
        if (confirm("Clear~ 다시 하시겠습니까?")) {
          mineIn.innerText = '';
          for (var i = 0; i < selDiff.length; i++) {
            var remover = selDiff[i].getAttribute("diff");
            selDiff[i].classList.remove(remover);
          }
          difficulty = 0;
        }
      }
    }

    init();
