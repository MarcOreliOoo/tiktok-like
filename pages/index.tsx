import axios from 'axios';
import { Video } from '../types';
import VideoCard from '../components/VideoCard';
import NoResults from '../components/NoResults';
import { BASE_URL } from '../utils/index';

interface IProps {
	videos: Video[],
}

//Path Intelissence
const Home = ({ videos }: IProps) => {
	
	return (
		<div className='flex flex-col gap-10 videos h-full'>
			{videos && videos.length ? (
				videos.map((video: Video) => (
					<VideoCard post={video} key={video._id} />
				))
			):(
				<NoResults text={'No Videos'} />
			)}
		</div>
	)
}

export const getServerSideProps = async() => {
	const { data } = await axios.get(`${BASE_URL}/api/post`);	
	
	return {
		props: {
			videos: data
		}
	}
}

export default Home;

