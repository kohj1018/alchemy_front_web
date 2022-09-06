import { NextPage } from 'next'
import BackHeader from '../components/layout/BackHeader'
import { useUserPillListStore } from '../stores/store'
import Link from 'next/link'
import PillManagementListItem from '../components/common/PillManagementListItem'
import { useRouter } from 'next/router'

const PillListManagement: NextPage = () => {
  const router = useRouter()
  const { userTakingPillList, setUserTakingPillList } = useUserPillListStore()

  const deletePill = (id: number) => {
    setUserTakingPillList(userTakingPillList.filter(x => x.id !== id))
  }

  return (
    <div>
      <BackHeader router={router} name='내 영양제 관리' />
      <Link href='search'>
        <a className='absolute right-2 top-1 border border-[#BABABA] rounded-3xl px-4 py-1'>추가</a>
      </Link>

      <div className='flex flex-col space-y-1.5 mt-5 px-3'>
        {userTakingPillList.map(pill => {
          return (
            <PillManagementListItem key={pill.id} id={pill.id} name={pill.name} maker={pill.maker} deleteFunc={deletePill} />
          )
        })}
      </div>
    </div>
  )
}

export default PillListManagement