import type { NextPage } from 'next'
import SearchBtn from '../components/common/search/SearchBtn'
import SEO from '../components/layout/SEO'
import MyPillList from '../components/common/MyPillList'
import ContainerWithBottomNav from '../components/layout/ContainerWithBottomNav'
import Image from 'next/image'
import bigLogo from '../public/asset/image/bigLogo.png'
import PillLenseFNB from '../components/layout/PillLenseFNB'
import MainHeader from '../components/layout/MainHeader'
import ChevronRight from '@mui/icons-material/ChevronRight'
import Link from 'next/link'
import useUserNutrientsBalanceData from '../hooks/useUserNutrientsBalanceData'
import useUserIntakeTimeTableByDate from '../hooks/useUserIntakeTimeTableByDate'
import dayjs, { Dayjs } from 'dayjs'
import React, { useEffect, useState } from 'react'
import {
  IntakeManagementType,
  SearchResultsItemType,
  SupplementDetailsType,
  TimeTableByDateType,
  TimeTableDataType,
} from '../utils/types'
import { getWeekNumber } from '../utils/functions/getWeekNumber'
import homeIntakeIllust from '../public/asset/image/homeIntakeIllust.png'
import { WeekDateBoxContainer } from '../components/common/intakeCalendar/IntakeCalendar'
import useUserId from '../hooks/useUserId'
import useUserIntakePillList from '../hooks/useUserIntakePillList'
import { arrayIsNotEmpty } from '../utils/functions/arrayIsNotEmpty'
import useUserPillList from '../hooks/useUserPillList'
import CheckBox from '@mui/icons-material/CheckBox'
import PillListItem from '../components/common/PillListItem'
import { convertEnDayToKoDay } from '../utils/functions/timeFormatFunc/convertEnDayToKoDay'

const Home: NextPage = () => {
  const userId: string | null = useUserId()
  const userPillList: SupplementDetailsType[] = useUserPillList()
  const intakePillList: IntakeManagementType[] = useUserIntakePillList()
  const [todayStr, setTodayStr] = useState<string>(dayjs().format('YYYY-MM-DD'))
  const [todayDayjs, setTodayDayjs] = useState<Dayjs>(dayjs())
  const [datesOfThisWeek, setDatesOfThisWeek] = useState<string[]>([])
  const [todayPills, setTodayPills] = useState<SearchResultsItemType[]>([])

  // 섭취중인 영양분 데이터 가져오기 (커스텀 훅)
  const { wellIntakePercent } = useUserNutrientsBalanceData()

  // 복용 관리 기록 데이터 가져오기 (커스텀 훅)
  const intakeTimeTableByDate: TimeTableByDateType | null = useUserIntakeTimeTableByDate(todayDayjs)

  // 오늘 날짜에 해당하는 일주일의 날짜를 string 형태의 배열로 만들어서 state에 저장
  useEffect(() => {
    let firstDateOfTheWeek = dayjs().day(0)
    const tempDates: string[] = []
    for (let i = 0; i < 7; i++) {
      tempDates.push(firstDateOfTheWeek.format('YYYY-MM-DD'))
      firstDateOfTheWeek = firstDateOfTheWeek.add(1, 'day')
    }
    setDatesOfThisWeek(tempDates)
  }, [])

  // 오늘의 영양제 확인 부분
  useEffect(() => {
    if (userId && intakeTimeTableByDate && Object.prototype.hasOwnProperty.call(intakeTimeTableByDate, todayStr)) {
      const todayPillListLog: TimeTableDataType[] = Object.values(intakeTimeTableByDate[todayStr].intakeHistory).flat()
      const tempTodayPills: SearchResultsItemType[] = []
      userPillList.forEach((pill) => {
        const matchOne: TimeTableDataType | undefined = todayPillListLog.find(x => x.pillId === pill.id)
        if (matchOne) {
          tempTodayPills.push({
            id: pill.id,
            name: pill.name,
            maker: pill.maker
          })
        }
      })
      setTodayPills(tempTodayPills)
    }
  }, [intakeTimeTableByDate])

  return (
    <ContainerWithBottomNav>
      <SEO title='BeeHealer' />

      <MainHeader />

      <div className='space-y-4'>
        {/* 검색 버튼 부분 */}
        <section className='bg-white p-4'>
          <SearchBtn />
        </section>

        {/* 밸런스 요약 부분 */}
        <Link href={arrayIsNotEmpty(userPillList) ? '/balance' : '/search'}>
          <a className='bg-white px-6 py-5 flex items-center justify-between text-gray-900'>
            {arrayIsNotEmpty(userPillList) && wellIntakePercent !== null ? (
              <div className='flex items-center space-x-4'>
                {/* 원형 그래프 */}
                <div
                  className='inline-block relative w-20 h-20 rounded-full flex items-center justify-center'
                  style={{ background: `conic-gradient(#3B82F6 0% ${wellIntakePercent}%, #BFDBFE ${wellIntakePercent}% 100%)` }}
                >
                <span className='w-14 h-14 bg-white rounded-full flex items-center justify-center'>
                  <p className='text-base font-bold'>{wellIntakePercent}%</p>
                </span>
                </div>
                {/* 요약 텍스트 */}
                <div className='space-y-0.5'>
                  <p className='text-lg leading-6 font-bold'>섭취 영양분의 {wellIntakePercent}%를<br/>잘 먹고 있어요!</p>
                  <p className='text-sm text-gray-400'>분석 리포트 보러가기</p>
                </div>
              </div>
            ) : (
              <div className='space-y-0.5'>
                <p className='text-base font-bold'>등록된 영양제가 없어요!<br/><strong className='text-primary'>내 영양제를 등록</strong>해주세요.</p>
                <p className='text-sm text-gray-400'>권장량에 맞춰 잘 먹고 있는지 확인하기</p>
              </div>
            )}
            
            <ChevronRight className='text-2xl' />
          </a>
        </Link>

        {/* Link끼리 띄우기용 */}
        <div></div> 

        {/* 복용 관리 요약 부분 */}
        <Link href={userId ? '/intake' : '/initial'}>
          <a>
            <div className='bg-white p-6 relative'>
              {userId ? (
                arrayIsNotEmpty(intakePillList) ? ( // userId도 있고 복용 관리 서비스도 하고 있는 경우
                  <>
                    {/* 일러스트 */}
                    <div className='absolute w-[9.25rem] h-[7.75rem] top-0 right-0'>
                      <Image
                        src={homeIntakeIllust}
                        className='object-cover'
                        layout='fill'
                      />
                    </div>
                    {/* 텍스트 부분 */}
                    <div className='space-y-2 text-gray-900'>
                      <p className='text-xl font-bold'>{dayjs().get('M')}월 {getWeekNumber(dayjs())}주차 복용 관리</p>
                      <p className='text-sm'>꾸준함이 좋은 건강을 만들어요!<br/>비힐러가 함께 도와드릴게요.</p>
                    </div>
                    {/* 일주일 복용 현황 부분 */}
                    <div className='mt-8 pointer-events-none'>
                      {intakeTimeTableByDate &&
                        <WeekDateBoxContainer
                          datesOfThisWeek={datesOfThisWeek}
                          intakeTimeTableByDate={intakeTimeTableByDate}
                          selectedDate={todayStr}
                          setSelectedDate={setTodayStr}
                        />
                      }
                    </div>
                  </>
                ) : ( // userId는 있지만 복용 관리 서비스를 하고 있지 않은 경우
                  <div className='w-full flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <p className='text-base font-bold'><strong className='text-primary'>복용 관리 서비스</strong>를 시작해보세요!<br/>까먹지 않고 챙겨먹도록 도와드릴게요!</p>
                      <p className='text-sm text-gray-400'>복용 알림 받으러가기</p>
                    </div>

                    <ChevronRight className='text-2xl' />
                  </div>
                )
              ) : ( // userId 자체가 없는 경우 (로그인 X)
                <div className='w-full flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <p className='text-base font-bold'><strong className='text-primary'>비힐러에 가입</strong>해보세요 😉<br/>까먹지 않고 챙겨먹도록 도와드릴게요!</p>
                    <p className='text-sm text-gray-400'>가입하고 복용 알림 받기</p>
                  </div>

                  <ChevronRight className='text-2xl' />
                </div>
              )}
            </div>
          </a>
        </Link>

        {/* 체크리스트 부분 */}
        {userId && intakeTimeTableByDate ? (
          <>
            <section className='pl-6 py-6 pr-8 bg-white flex items-center justify-between'>
              <div className='flex flex-col'>
                <div className='flex items-center space-x-3 text-gray-900'>
                  <p className='text-lg font-bold'>체크리스트</p>
                  <p className='text-sm'>{dayjs().format('YY.MM.DD')} ({convertEnDayToKoDay(dayjs().format('ddd'))})</p>
                </div>
                <p className='text-sm text-gray-400'>오늘의 영양제는 섭취 하셨나요?</p>
              </div>
              <CheckBox className={'text-5xl' + (intakeTimeTableByDate[todayStr].remainIntakePillCnt === 0 ? ' text-primary' : ' text-gray-200')} />
            </section>

            {/* 오늘의 영양제 부분 */}
            <section className='p-6 bg-white space-y-4'>
              <p className='text-base text-gray-900'>오늘의 영양제 <strong>{todayPills.length}개</strong></p>
              <div className='flex flex-col space-y-2'>
                {todayPills.map((pill) =>
                  <PillListItem key={pill.id} id={pill.id} name={pill.name} maker={pill.maker} prefixDomain='/pill-details' />
                )}
              </div>
            </section>
          </>
        ) : (
          <div></div>
        )}
      </div>

      <div className='mt-6 px-6 flex flex-col space-y-2 text-xs text-gray-400'>
        <p>대표 관리자 : 표지원, 고병욱, 김민준</p>
        <p>전화번호 : 010-2221-7086</p>
        <p>주소 : 서울시 강남구 테헤란로 311(역삼동) 아남타워빌딩 7층</p>
      </div>

      <PillLenseFNB bottomMargin='bottom-[4.5rem]' />
    </ContainerWithBottomNav>
  )
}

export default Home
