import { useMovies } from "./Movies.js";
// 用于测试 hooks 的 lib
import { act, renderHook } from "@testing-library/react-hooks";

const mockMovies = {
	Search: [
		{
			imdbID: 0,
			score: 0
		},
		{
			imdbID: 1,
			score: 0
		},
		{
			imdbID: 2,
			score: 0
		},
		{
			imdbID: 3,
			score: 0
		},
		{
			imdbID: 4,
			score: 0
		}
	]
};

const mockMoviesPage2 = {
	Search: [
		{
			imdbID: 5,
			score: 0
		},
		{
			imdbID: 6,
			score: 0
		}
	]
};

fetch.mockResponse(req => {
	switch (req.url) {
		case "http://www.omdbapi.com/?s=action&page=1&apikey=4640ef30":
			return Promise.resolve(JSON.stringify(mockMovies));
		case "http://www.omdbapi.com/?s=action&page=2&apikey=4640ef30":
			return Promise.resolve(JSON.stringify(mockMoviesPage2));
		default:
			return Promise.reject("bad url");
	}
});

describe("useMovies hook", () => {
	it("should render hook and expose an API", () => {
		// 初始化hooks
		const { result } = renderHook(() => useMovies());
		// 对象属性 空数组(是否初始化数组成功)
		expect(result.current.movies).toEqual([]);
		expect(result.current.queue).toEqual([]);
		// 对象是否为function 函数
		expect(typeof result.current.like).toBe("function");
		expect(typeof result.current.dislike).toBe("function");
		expect(typeof result.current.addToQueue).toBe("function");
		expect(typeof result.current.fetchAll).toBe("function");
	});

	it("should fetch a list of movies", async () => {
		const { result } = renderHook(() => useMovies());
		// 异步调用 api 获取数据
		await act(async () => await result.current.fetchAll());
		expect(result.current.movies).toEqual(mockMovies.Search);
	});

	it("should fetch another page of movies", async () => {
		const { result } = renderHook(() => useMovies());
		await act(async () => await result.current.fetchAll());
		await act(async () => await result.current.fetchAll());
		// 调用两次 api  测试分页数据是否正确
		expect(result.current.movies).toEqual([
			...mockMoviesPage2.Search,
			...mockMovies.Search
		]);
	});

	it("should allow us to add movies into the queue", async () => {
		const { result } = renderHook(() => useMovies());
		await act(async () => await result.current.fetchAll());
		// 将单个 movie 添加进 queue 
		act(() => result.current.addToQueue(result.current.movies[4]));
		expect(result.current.queue).toEqual([result.current.movies[4]]);
	});

	it("should allow us to like a movie", async () => {
		const { result } = renderHook(() => useMovies());
		await act(async () => await result.current.fetchAll());
		// 异步将 movies 下标4 的数据score 加 1
		act(() => result.current.like(result.current.movies[4]));
		// 遍历所有 movies 的 score 判断是否为 [0, 0, 0, 0, 1]. 初始值为 [0, 0, 0, 0, 0]
		expect(result.current.movies.map(m => m.score)).toEqual([0, 0, 0, 0, 1]);
	});

	it("should allow us to dislike a movie", async () => {
		const { result } = renderHook(() => useMovies());
		await act(async () => await result.current.fetchAll());
		act(() => result.current.dislike(result.current.movies[4]));
		// 遍历所有 movies 的 score 判断是否为 [0, 0, 0, 0, -1]. 初始值为 [0, 0, 0, 0, 0]
		expect(result.current.movies.map(m => m.score)).toEqual([0, 0, 0, 0, -1]);
	});
});
