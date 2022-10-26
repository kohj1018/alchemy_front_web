import { NextPage } from 'next'
import ContainerWithBottomNav from '../../components/layout/ContainerWithBottomNav'
import IntakeCalendar from '../../components/common/intakeCalendar/IntakeCalendar'
import MainHeader from '../../components/layout/MainHeader'
import ScheduleBox from '../../components/common/intake/ScheduleBox'
import Link from 'next/link'
import { useUserInformationStore, useUserIntakeManagementStore, useUserPillListStore } from '../../stores/store'
import React, { useState } from 'react'
import { IntakeManagementType, TimeTableByDateType } from '../../utils/types'
import LoadingCircular from '../../components/layout/LoadingCircular'
import dayjs, { Dayjs } from 'dayjs'
import { arrayIsNotEmpty } from '../../utils/functions/arrayIsNotEmpty'
import Image from 'next/image'
import balanceIllust from '../../public/asset/image/balanceIllust.png'
import intakeIllust from '../../public/asset/image/intakeIllust.png'
import emptyPillIllust from '../../public/asset/image/emptyPillIllust.jpg'
import useUserIntakeTimeTableByDate from '../../hooks/useUserIntakeTimeTableByDate'
import { signIn } from 'next-auth/react'
// import { BOTTOM_NAV_BAR_PADDING_TAILWINDCSS_VALUE } from '../../utils/constant/systemConstants'

const Intake: NextPage = () => {
  const userId = useUserInformationStore(state => state.userId)
  const userTakingPillList = useUserPillListStore(state => state.userTakingPillList)
  const intakePillList: IntakeManagementType[] = useUserIntakeManagementStore(state => state.intakePillList)
  const intakeServiceStartDate: Dayjs | null = useUserIntakeManagementStore(state => state.intakeServiceStartDate)
  const [selectedYearANDMonth, setSelectedYearANDMonth] = useState<Dayjs>(dayjs())
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'))  // 오늘 날짜로 초기 설정

  // 복용 관리 기록 데이터 가져오기 (커스텀 훅)
  const intakeTimeTableByDate: TimeTableByDateType | null = useUserIntakeTimeTableByDate(selectedYearANDMonth)

  // 로그인이 안되어 있는 경우 redirect
  if (!userId) {
    return (
      <ContainerWithBottomNav>
        <MainHeader />

        <div className={`absolute top-10 left-0 right-0 bottom-14 bg-white flex flex-col items-center justify-center space-y-4`}>
          <p className='text-lg text-gray-900 text-center'>3초만에 가입해서,<br/><strong className='text-primary'>복용 알림 받고 기록 관리</strong>하기!</p>
          <button
            className='w-11/12 bg-primary text-gray-50 shadow-md py-3 rounded-[0.625rem]'
            onClick={() => signIn()}
          >
            로그인 하기
          </button>
        </div>
      </ContainerWithBottomNav>
    )
  }

  // 등록된 영양제가 없는 경우 보여지는 화면
  if (!arrayIsNotEmpty(userTakingPillList)) {
    return (
      <ContainerWithBottomNav>
        <MainHeader />

        <div className='bg-white w-full h-full flex flex-col items-center'>
          <div className='mt-[6.25rem] relative w-[18.75rem] h-[12.5rem]'>
            <Image
              src={balanceIllust}
              className='object-cover'
              layout='fill'
            />
          </div>
          <h1 className='mt-[1.5625rem] text-xl'>영양제 복용 관리 시작하기</h1>
          <p className='mt-[1.25rem] text-base'>섭취중인 영양제를 먼저 등록해주세요</p>
          <Link
            href='/search'
          >
            <a className='mt-[2.1875rem] w-11/12 h-10 bg-primary rounded-[0.625rem] text-base text-white flex items-center justify-center'>
              섭취중인 영양제 등록하러 가기
            </a>
          </Link>
        </div>
      </ContainerWithBottomNav>
    )
  }

  // 등록된 영양제들은 있지만 영양제 시간표를 생성하지 않은 경우
  if (!arrayIsNotEmpty(intakePillList)) {
    return (
      <ContainerWithBottomNav>
        <MainHeader />

        <div className='bg-white w-full h-full flex flex-col items-center'>
          <div className='mt-[6.25rem] relative w-[12.5rem] h-[12.5rem]'>
            <Image
              src={intakeIllust}
              className='object-cover'
              layout='fill'
            />
          </div>
          <h1 className='mt-[1.5625rem] text-xl'>영양제 복용 관리 시작하기</h1>
          <p className='mt-[1.25rem] text-base'>섭취중인 영양제 바탕으로 추천 시간 알림 수신</p>
          <Link
            href='/intake/edit-schedule/add'
          >
            <a className='mt-[2.1875rem] w-11/12 h-10 bg-primary rounded-[0.625rem] text-base text-white flex items-center justify-center'>
              영양제 복용 알림 받기
            </a>
          </Link>
        </div>
      </ContainerWithBottomNav>
    )
  }

  // 로딩
  if (!intakeTimeTableByDate) return <LoadingCircular />

  // 등록된 영양제가 있고 영양제 시간표를 생성한 경우 보여지는 화면
  return (
    <ContainerWithBottomNav>
      <MainHeader />
      <div className='mt-2 space-y-2'>
        {/* 복용 기록 캘린더 */}
        <IntakeCalendar
          intakeTimeTableByDate={intakeTimeTableByDate}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedYearANDMonth={selectedYearANDMonth}
          setSelectedYearANDMonth={setSelectedYearANDMonth}
          intakeServiceStartDate={intakeServiceStartDate === null ? null : dayjs(intakeServiceStartDate)}
        />

        {/* 연속 섭취중 일수 + 편집 버튼 */}
        <div className='bg-surface px-6 py-4 text-xs flex items-center justify-between'>
          {/* TODO: 나중에 연속 섭취 중 일수도 추가 */}
          {/*<p className='text-gray-900'>🔥 <strong className='font-bold text-red-500'>1일째</strong> 연속 섭취중</p>*/}
          <p className='text-base text-gray-900 font-bold'>{dayjs(selectedDate).format('M월 D일의 복용 기록')}</p>
          <Link href='/intake/edit-schedule'>
            <a className='text-primary'>
              시간표 편집
            </a>
          </Link>
        </div>

        {/* 영양제 시간표 부분 */}
        {intakeTimeTableByDate[selectedDate] && intakeTimeTableByDate[selectedDate].totalIntakePillCnt !== 0 ? (
          Object.keys(intakeTimeTableByDate[selectedDate].intakeHistory) &&
          Object.keys(intakeTimeTableByDate[selectedDate].intakeHistory).sort().map((intakeTime) =>
            <ScheduleBox
              key={intakeTime}
              selectedDate={selectedDate}
              intakeTime={intakeTime}
              timeTableDataList={intakeTimeTableByDate[selectedDate].intakeHistory[intakeTime]}
            />
          )
        ) : (
          <div className='bg-white pb-16 flex flex-col items-center'>
            <div className='relative w-[15.625rem] h-[15.625rem]'>
              <Image
                src={emptyPillIllust}
                className='object-cover'
                layout='fill'
              />
            </div>
            <p className='text-base text-gray-900'>먹어야 할 영양제가 없어요!</p>
          </div>
        )}
      </div>
    </ContainerWithBottomNav>
  )
}

export default Intake
