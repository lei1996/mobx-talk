import { useState, useRef } from "react";

export const useMovies = () => {
	const [movies, setMovies] = useState([]);
	// 缓存page的值
	const page = useRef(1);

	// 获取movies 数据
	async function fetchAll() {
		const res = await fetch(
			`http://www.omdbapi.com/?s=action&page=${page.current}&apikey=4640ef30`
		);
		const newMovies = await res.json();
		setMovies(movies => [
			// 初始化score 为 0 不然会是 NAN
			...newMovies.Search.map(m => ({ ...m, score: 0 })),
			...movies
		]);
		page.current++;
	}

	// 添加 movie 到 队列
	function _addToQueue(movie) {
		setMovies(movies => {
			// 复制一份movies 对象
			const moviesCopy = [...movies];
			const idx = moviesCopy.indexOf(movie);
			// 添加 inQueue true 属性
			moviesCopy.splice(idx, 1, { ...movie, inQueue: true });
			return moviesCopy;
		});
	}

	// 喜欢
	function _like(movie) {
		setMovies(movies => {
			const moviesCopy = [...movies];
			const idx = moviesCopy.indexOf(movie);
			// 当前 socre + 1
			moviesCopy.splice(idx, 1, { ...movie, score: movie.score + 1 });
			return moviesCopy;
		});
	}

	// 取消喜欢
	function _dislike(movie) {
		setMovies(movies => {
			const moviesCopy = [...movies];
			const idx = moviesCopy.indexOf(movie);
			// 当前 socre - 1
			moviesCopy.splice(idx, 1, { ...movie, score: movie.score - 1 });
			return moviesCopy;
		});
	}

	// 使用 useRef 缓存函数 防止无关 component 的 rebuild 
	const addToQueue = useRef(_addToQueue);
	const like = useRef(_like);
	const dislike = useRef(_dislike);

	return {
		movies,
		queue: movies.filter(m => m.inQueue),
		// Ref 的 当前状态
		like: like.current,
		dislike: dislike.current,
		addToQueue: addToQueue.current,
		fetchAll
	};
};
