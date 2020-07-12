import React from "react";
import { observable, action } from "mobx";

export const MoviesStore = () => {
	let page = 1;
	const store = observable({
		movies: [],
		get queue() {
			return store.movies.filter(m => m.inQueue);
		},
		fetchAll: action(async () => {
			const res = await fetch(
				`http://www.omdbapi.com/?s=action&page=${page}&apikey=4640ef30`
			);
			const newMovies = await res.json();
			// 获取分页数据时，新增到数组
			store.movies.unshift(...newMovies.Search.map(m => ({ ...m, score: 0 })));
			page++;
		}),
		// movie: view 层调用func 传入的 引用对象
		addToQueue: action(movie => {
			movie.inQueue = true;
		}),
		like: action(movie => {
			movie.score++;
		}),
		dislike: action(movie => {
			movie.score--;
		})
	});

	return store;
};

export default React.createContext();
