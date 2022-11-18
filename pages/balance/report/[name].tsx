import ContainerWithBottomNav from '../../../components/layout/ContainerWithBottomNav'
import BackHeader from '../../../components/layout/BackHeader'
import { useRouter } from 'next/router'
import IntakeAdequateTag from '../../../components/tag/IntakeAdequateTag'
import { CompareContent } from '../../../utils/functions/CompareContent'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import React, { useEffect, useState } from 'react'
import EfficiencyTag from '../../../components/tag/EfficiencyTag'
import { arrayIsNotEmpty } from '../../../utils/functions/arrayIsNotEmpty'
import HorizontalRule from '@mui/icons-material/HorizontalRule'
import Link from 'next/link'

// interface QueryProps extends UserIntakeNutrientType {
//   // query로 왔기 때문에 string으로 온다.
//   state: string
//   excessOrLackContent: string | null
// }

const Report = () => {
  const router = useRouter()
  // query로 넘어오면 string으로 오는 것 때문에 아래와 같이 일일이 정의
  const name: string = router.query.name as string
  const state: number = parseInt(router.query.state as string)
  const content: number = parseInt(router.query.content as string)
  const reqMin: number = parseInt(router.query.reqMin as string)
  const reqAvg: number = parseInt(router.query.reqAvg as string)
  const reqMax: number = parseInt(router.query.reqMax as string)
  const unit: string = router.query.unit as string
  const tips: string[] = router.query.tips as string[]
  const efficacy: string[] = router.query.efficacy as string[]
  // 넘어올 때 null도 string으로 되기 때문에 아래와 같이 처리
  const strExcessOrLackContent: string = router.query.excessOrLackContent as string
  let excessOrLackContent: number | null = null
  if (strExcessOrLackContent !== '') {
    excessOrLackContent = parseInt(strExcessOrLackContent)
  }
  // let {
  //   name,
  //   state,
  //   content,
  //   reqMin,
  //   reqAvg,
  //   reqMax,
  //   unit,
  //   tips,
  //   efficacy,
  //   excessOrLackContent
  // } = router.query as unknown as QueryProps  // TODO: as unknown 없애고 다른 방법 찾기 (TS 공변성 공부)
  // const parseState = parseInt(state)
  // let parseExcessOrLackContent: number | null = null
  // if (excessOrLackContent !== null) {
  //   parseExcessOrLackContent = parseInt(excessOrLackContent)
  // }

  // reqMin, reqAvg, reqMax 기준과 비교하는 클래스
  // 해당 클래스에 값을 넣고 클래스의 메서드를 사용해서 비교하면 됨.
  const compare = new CompareContent(content, reqMin, reqAvg, reqMax)
  if (compare.compareWithMinAndAvg()) {  // 최소에 해당할 경우 충분량까지 얼마나 부족한지 보여주기 위한 것
    excessOrLackContent = reqAvg - content
  }

  const [contentPercent, setContentPercent] = useState<number>(0)
  const [reqMinPercent, setReqMinPercent] = useState<number>(0)
  const [reqAvgPercent, setReqAvgPercent] = useState<number>(0)

  // reqMax을 100%라고 할 때 content, reqMin, reqAvg가 각각 몇 프로인지 구하기
  useEffect(() => {
    // reqMax가 없는 경우 (상한량이 없는 경우) reqAvg를 80%로 기준잡고 계산
    if (reqMax === 0 || reqMax === null) {
      setContentPercent(Math.round(content / reqAvg * 80))
      setReqMinPercent(Math.round(reqMin / reqAvg * 80))
      setReqAvgPercent(Math.round(reqAvg / reqAvg * 80))
    } else {  // reqMax가 있는 경우 (상한량이 있는 경우)
      setContentPercent(Math.round(content / reqMax * 90))  // content는 전체 바를 부모 태그로 표현할 것이기에 90을 곱함(reqMax을 전체 바에서 90퍼로 표현하기 때문)
      setReqMinPercent(Math.round(reqMin / reqMax * 90))
      setReqAvgPercent(Math.round(reqAvg / reqMax * 90))
    }
  }, [])

  return (
    <ContainerWithBottomNav>
      <BackHeader router={router} name='영양제 분석 리포트' />

      <div className='space-y-4'>
        {/* 영양분 부족, 과다 정보 제공 부분 */}
        <section className='p-6 bg-white text-gray-900'>
          <IntakeAdequateTag state={state} excessOrLackContent={null} unit={null} />
          <h1 className='text-2xl font-bold mt-2'>{name}</h1>
          <StateText state={state} excessOrLackContent={excessOrLackContent} unit={excessOrLackContent === null ? null : unit} />

          <p className='mt-6 text-sm font-bold text-gray-400'>관련 건강 고민 토픽</p>
          <div className='mt-1 flex items-center flex-wrap gap-2'>
            {arrayIsNotEmpty(efficacy) &&
              efficacy.map((efficacy) =>
              <EfficiencyTag key={efficacy} tagName={efficacy} />
            )}
          </div>
        </section>

        {/* 현재 섭취량 비교 그래프 부분 */}
        <section className='p-6 bg-white text-gray-900 space-y-2'>
          <Link href='/balance/category'>
            <a className='flex items-center'>
              <p className='text-base font-bold'>현재 섭취량 비교</p>
              <InfoOutlined className='text-base text-gray-400 ml-1' />
            </a>
          </Link>

          <div className='flex items-center space-x-2'>
            <span className='text-xs text-amber-500 font-medium'>
              <HorizontalRule className='text-xs'/>최소량
            </span>
                <span className='text-xs text-emerald-500 font-medium'>
              <HorizontalRule className='text-xs'/>충분량
            </span>
                <span className='text-xs text-red-500 font-medium'>
              <HorizontalRule className='text-xs'/>상한량
            </span>
          </div>

          {/* 그래프 바 부분 */}
          <article className='pt-[2.125rem] pb-[1.625rem]'>
            {/* 전체 그래프 부분 */}
            <div className='relative h-6 bg-gray-100'>
              {/* reqMax 부분 */}
              <div className='relative left-0 top-0 w-[90%] h-[1.875rem] bg-transparent border-r-2 border-r-red-500 z-20'>
                {/* reqMin 부분 */}
                <div
                  className='absolute left-0 top-0 h-[1.875rem] bg-transparent border-r-2 border-r-amber-500'
                  style={{width: `${reqMinPercent}%`}}
                >
                  {/* reqMin 수치 표시 */}
                  <p className='absolute w-14 right-[-1.75rem] top-[2.125rem] text-center text-xs'>{reqMin}{unit}</p>
                </div>

                {/* reqAvg 부분 */}
                <div
                  className='relative left-0 top-0 h-[1.875rem] bg-transparent border-r-2 border-r-emerald-500'
                  style={{width: `${reqAvgPercent}%`}}
                >
                  {/* reqAvg 수치 표시 */}
                  <p className='absolute w-14 right-[-1.75rem] top-[2.125rem] text-center text-xs'>{reqAvg}{unit}</p>
                </div>

                {/* reqMax 수치 표시 */}
                <p className='absolute w-14 right-[-1.75rem] top-[2.125rem] text-center text-xs'>{reqMax}{unit}</p>
              </div>

              {/* content 부분 */}
              <div
                className='absolute left-0 top-0 bottom-0 bg-primary'
                style={{width: `${contentPercent}%`, maxWidth: '100%'}}
              >
                <div
                  className='absolute w-full left-0 bottom-0 h-[1.875rem] bg-transparent border-r-2 border-r-primary'
                >
                  {/* content 수치 표시 */}
                  <p className='absolute w-14 right-[-1.75rem] bottom-[2.125rem] text-center text-base font-bold text-primary'>{content}{unit}</p>
                </div>
              </div>
            </div>
          </article>
        </section>
      </div>
    </ContainerWithBottomNav>
  )
}

interface StateTextProps {
  state: number
  excessOrLackContent: number | null
  unit: string | null
}

function StateText({ state, excessOrLackContent, unit }: StateTextProps) {
  switch (state) {
    case 0:
      return (
        <p className='text-lg font-bold text-primary mt-4'>
          권장량보다 {excessOrLackContent}{unit} 부족해요!
        </p>
      )
    case 1:
      return (
        <>
          <p className='text-lg font-bold text-primary mt-4'>
            충분량보다 {excessOrLackContent}{unit} 부족해요!
          </p>
          <p className='text-base font-bold mt-2'>일일 권장량은 사실 최소량이랍니다 😉<br/>충분한 효능을 보기 위해서는 충분량 이상의 양을 먹어야 해요!</p>
        </>
      )
    case 2:
      return (
        <p className='text-lg font-bold text-primary mt-4'>
          최적의 효능을 볼 수 있는 충분량 이상을 잘 먹고 있어요! 👍
        </p>
      )
    case 3:
      return (
        <>
          <p className='text-lg font-bold text-primary mt-4'>
            상한량보다 {excessOrLackContent}{unit} 많이 먹고 있어요!
          </p>
          <p className='text-base font-bold mt-2'>상한량을 넘으면 영양분 과잉에 따른<br/>부작용이 일어날 수 있어요 😮<br/>복용량을 조절해보세요!</p>
        </>
      )
    default:
      return (
        <p className='text-lg font-bold text-primary mt-4'>오류</p>
      )
  }
}

export default Report