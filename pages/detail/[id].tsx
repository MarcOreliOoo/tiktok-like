import React, {useState, useEffect, useRef} from 'react'
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { GoVerified } from 'react-icons/go';
import { MdOutlineCancel } from 'react-icons/md';
import { BsFillPlayFill } from 'react-icons/bs';
import { HiVolumeUp, HiVolumeOff } from 'react-icons/hi';
import axios from 'axios';
import { BASE_URL } from '../../utils/index';
import { Video } from '../../types';
import useAuthStore from '../../store/authStore';
import LikeButton from '../../components/LikeButton';
import Comments from '../../components/Comments';

interface IProps {
	postDetails: Video
}

const Detail = ({ postDetails }:IProps) => {
	const [post, setPost] = useState(postDetails);
	const [playing, setPlaying] = useState(false);
	const [isVideoMuted, setIsVideoMuted] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const router = useRouter();
	const { userProfile }:any = useAuthStore();
	const [comment, setComment] = useState('');
	const [isPostingComment, setIsPostingComment] = useState(false);

	const onVideoClick = () => {
		if(playing){
			videoRef?.current?.pause();
			setPlaying(false);
		} else {
			videoRef?.current?.play();
			setPlaying(true);
		}
	};
	
	useEffect(() => {
		if(post && videoRef?.current){
			videoRef.current.muted = isVideoMuted;
		}
	},[post, isVideoMuted]);

	const handleLike = async (like: boolean) => {
		if(userProfile){
			const { data } = await axios.put(`${BASE_URL}/api/like`, {
				userId: userProfile._id,
				postId: post._id,
				like
			});
			//set of an object so we need:
			//1- to open up the new object
			//2- to spread the previous state of the object
			//3- to select the property which we want to update
			setPost({...post, likes: data.likes});
		}
	}

	const addComment = async (e) => {
		//e.preventDefault to avoid our website reload after posting a comment
		e.preventDefault();
		if(userProfile && comment){
			//set to true becasuse the process of posting a comment has started
			setIsPostingComment(true);

			const { data } = await axios.put(`${BASE_URL}/api/post/${post._id}`,{
				userId: userProfile._id,
				comment
			});

			setPost({...post, comments: data.comments});
			setComment('');
			setIsPostingComment(false);
		}
	}

	if(!post) return null;

	return (
		<div className='flex w-full absolute top-0 left-0 bg-white flex-wrap lg:flex-nowrap'>
			<div className='relative flex-2 w-[1000px] lg:w-9/12 flex justify-center items-center bg-blurred-img bg-no-repeat bg-cover bg-center'>
				{/* Closing detail and router.back() */}
				<div className='absolute top-6 left-2 lg:left-6 flex gap-6 z-50'>
					<p className='cursor-pointer' onClick={() => router.back()}>
						<MdOutlineCancel className='text-white text-[35px]' />
					</p>
				</div>
				{/* Video view */}
				<div className='relative'>
					{/* Video */}
					<div className='lg:h-[100vh] h-[60vh]'>
						<video
							ref={videoRef}
							src={post.video.asset.url}
							className="h-full cursor-pointer"
							loop
							onClick={() => {}}
						>
						</video>
					</div>
					{/* Video button */}
					<div className='absolute top-[45%] left-[45%] cursor-pointer'>
						{!playing && (
							<button onClick={onVideoClick}>
								<BsFillPlayFill className='text-white text-6xl lg:text-8xl'/>
							</button>
						)}
					</div>
				</div>
				{/* Mute functionnality */}
				<div className='absolute bottom-5 lg:bottom-10 right-5 lg:right-10 cursor-pointer'>
					{isVideoMuted ? (
						<button onClick={() => setIsVideoMuted(false)}>
							<HiVolumeOff className='text-black text-2xl lg:text-4xl'/>
						</button>
					):(
						<button onClick={() => setIsVideoMuted(true)}>
							<HiVolumeUp className='text-black text-2xl lg:text-4xl'/>
						</button>
					)}
				</div>
			</div>

			{/* Right part of the detail page */}
			<div className='relative w-[1000px] md:w-[900px] lg:w-[700px]'>
				<div className='lg:mt-20 mt-10'>
					<div className='flex gap-3 cursor-pointer p-2 font-semibold rounded'>
						{/* for profil pic on each post*/}
						<div className='ml-4 md:w-20 md:h-20 w-16 h-16'>
							<Link href="/">
								<>
									<Image width={62} height={62} className="rounded-full" src={post.postedBy.image} alt="profile pic" layout="responsive" />
								</>
							</Link>
						</div>
						{/* for profil name + verified status*/}
						<div>
							<Link href="/">
								<div className='mt-3 flex flex-col gap-2'>
									<p className='gap-2 flex md:text-md items-center font-bold text-primary'>
										{post.postedBy.userName}{' '}<GoVerified className='text-blue-400 text-md' />
									</p>
									<p className='capitalize font-medium text-xs text-gray-500 hidden md:block'>
										{post.postedBy.userName}
									</p>
								</div>
							</Link>
						</div>
					</div>
					
					{/*Video caption */}
					<p className='px-10 text-lg text-gray-600'>
						{post.caption}
					</p>
					
					{/* Comment section */}
					<div className='mt-10 px-10'>
						{userProfile && (
							<LikeButton 
								likes={post.likes}
								handleLike={() => handleLike(true)}
								handleDisLike={() => handleLike(false)} />
						)}
					</div>
					<Comments 
						comment={comment}
						setComment={setComment}
						addComment={addComment}
						comments={post.comments}
						isPostingComment={isPostingComment}
					/>
				</div>
			</div>
		</div>
	)
}

export const getServerSideProps  = async ({
	params: { id }
} : {
	params: { id: string}
}) => {
	const { data } = await axios.get(`${BASE_URL}/api/post/${id}`);
	return {
		props: {
			postDetails: data
		}
	}
}

export default Detail;