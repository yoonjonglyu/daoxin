import type { MenuItemProps } from '../../components/aside/SideMenu';
import Card from '../../components/card/Card';

import DaoXinChange from '../../features/daoxinchange/DaoXinChange';

const DaoXinAside: Array<MenuItemProps> = [
  {
    key: 'about',
    title: 'About',
    content: (
      <Card>
        <p>
          <strong>해당 앱은 사용자의 습관 형성과 관리를 위한 앱</strong>입니다.
        </p>

        <p>
          <em>선협물에서 영감을 받은 컨셉</em>으로, 꾸준히 정해진 일을 실천하며
          마음과 의지를 단련하고,
          <strong> 한결같음을 유지하는 것</strong>이 이 앱의 핵심 목표입니다.
        </p>

        <p>
          이러한 과정을 <strong>‘도심(道心)’ 그래프</strong>로 시각화하여,
          사용자가 자신의 변화를 직접 확인할 수 있도록 합니다.
        </p>

        <p>
          사용자가 매일 정해진 일과를 수행할 때마다 도심 게이지가{' '}
          <strong style={{ color: '#1a73e8' }}>+1</strong>씩 상승하며, 아래의
          단계를 순차적으로 거쳐 도심이 성장합니다:
        </p>

        <ul
          style={{
            marginLeft: '20px',
            marginTop: '10px',
            marginBottom: '10px',
          }}>
          <li>
            <strong>발심</strong> – 마음을 내다
          </li>
          <li>
            <strong>승화</strong> – 수행이 삶에 녹아드는 단계
          </li>
          <li>
            <strong>응심</strong> – 마음이 굳어지다
          </li>
          <li>
            <strong>천교</strong> – 천심에 이르다
          </li>
        </ul>

        <p>
          반면,{' '}
          <strong style={{ color: '#d93025' }}>
            하루라도 일과를 수행하지 않으면
          </strong>{' '}
          도심 게이지는
          <strong style={{ color: '#d93025' }}> ×1 감소</strong>하게 되며,
          즉각적인 피드백을 통해 <em>꾸준함과 항상성을 유지하도록 유도</em>
          합니다.
        </p>
      </Card>
    ),
  },
  {
    key: 'core',
    title: '참장공',
    content: (
      <Card>
        <div
          style={{
            fontSize: '26px',
            fontWeight: '600',
            color: '#1c2e2f',
            marginBottom: '16px',
          }}>
          참장공 (站樁功)
        </div>
        <p
          style={{
            fontSize: '17px',
            color: '#4a5a5b',
          }}>
          참장공은 ‘서 있는 명상’이라 불리는 중국 전통 기공 수련법입니다. 일정한
          자세를 유지한 채 호흡과 의식을 정돈하며, 몸과 마음의 균형을 되찾는 데
          도움을 줍니다.
          <br />
          <br />이 수련은 겉보기엔 단순히 가만히 서 있는 것처럼 보이지만, 내면의
          에너지 흐름을 조율하고 깊은 평온을 경험하게 합니다. 현대인에게는{' '}
          <strong>스트레스 해소, 집중력 향상, 신체 정렬 회복</strong> 등 심신
          건강을 위한 명상법으로도 널리 권장되고 있습니다.
        </p>
      </Card>
    ),
  },
  {
    key: 'medi',
    title: '명상',
    content: (
      <Card>
        <div
          style={{
            fontSize: '26px',
            fontWeight: '600',
            color: '#1c2e2f',
            marginBottom: '16px',
          }}>
          명상이란?
        </div>
        <p
          style={{
            fontSize: '17px',
            color: '#4a5a5b',
          }}>
          명상은 현재 이 순간에 집중하며, 마음의 움직임을 알아차리는 수련입니다.
          대표적인 방식으로는 <strong>마음챙김 명상</strong>,{' '}
          <strong>호흡 명상</strong>,<strong>걷기 명상</strong> 등이 있으며,
          각기 다른 방식으로 내면의 고요함과 집중 상태를 기를 수 있습니다.
          <br />
          <br />
          정기적인 명상은 스트레스를 줄이고, 불안과 과도한 생각에서 벗어나
          감정적 평형을 되찾는 데 도움을 줍니다. 바쁜 일상 속에서도{' '}
          <strong>하루 5분</strong>의 명상은 삶에 깊은 안정과 여유를 불어넣어
          줍니다.
        </p>
      </Card>
    ),
  },
  {
    key: 'change',
    title: '할일변경',
    content: <DaoXinChange />,
  },
];

export default DaoXinAside;
