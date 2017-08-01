import React from "react";
import { fromJS, Map } from "immutable";
import { Link } from "react-router-dom";

function ruleToState(rules) {
	let ret = {};
	Object.keys(rules).forEach((ruleName) => {
		ret[ruleName] = {};
		rules[ruleName].checkbox.forEach((option) => {
			 ret[ruleName][option.name] = true;
		});
		rules[ruleName].textarea.forEach((option) => {
			 ret[ruleName][option.name] = "";
		});
	});
	return fromJS(ret);
}

class Extendable extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div style={{ marginBottom: "35px" }}>
				<h5 className="title is-5">{this.props.name}</h5>
				{
					(() => {
						if (this.props.isExtended) {
							return (
								<div>
									<a onClick={this.props.toggle}>收起</a>
									{this.props.children}
								</div>
							);
						} else {
							return <a onClick={this.props.toggle}>展開</a>;
						}
					})()
				}
			</div>
		);
	}
}

function Checkbox(props) {
	return (
		<div key={props.option.name} className="field">
			<label className="checkbox">
				<input
					onChange={props.onChange}
					checked={props.checked}
					name={props.option.name}
					type="checkbox" />
				{props.option.display}
			</label>
		</div>
	);
}

function TextArea(props) {
	return (
		<div key={props.option.name} className="field">
			<label className="label">{props.option.display}</label>
			<div className="control">
				<textarea
					value={props.value}
					onChange={props.onChange}
					name={props.option.name}
					className="textarea"
					placeholder={props.option.display} />
			</div>
		</div>
	);
}

// props 傳入 ruleDefinition, ruleState, setRules
class RuleGroup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			show: Map({
				formRules: false,
				renderRules: false,
				backendRules: false,
			})
		};
		this.toggleExtendable = this.toggleExtendable.bind(this);
		this.handleRuleChange = this.handleRuleChange.bind(this);
		this.createExtendable = this.createExtendable.bind(this);
	}
	toggleExtendable(someRules) {
		return () => {
			this.setState({
				show: this.state.show.set(someRules, !this.state.show.get(someRules))
			});
		};
	}
	handleRuleChange(rule, name) {
		return (event) => {
			const target = event.target;
			const value = target.type === "checkbox" ? target.checked : target.value;
			let c = Map({
				[rule]: Map({ [name]: value })
			});
			this.props.setRules(this.props.ruleState.mergeDeep(c));
		};
	}
	createExtendable(someRules) {
		return (
			<Extendable
				key={someRules}
				name={this.props.ruleDefinition[someRules].display}
				toggle={this.toggleExtendable(someRules)}
				isExtended={this.state.show.get(someRules)}>
				{
					[
						...this.props.ruleDefinition[someRules].textarea.map((option) => {
							return (
								<TextArea
									key={option.name}
									option={option}
									value={this.props.ruleState.get(someRules).get(option.name)}
									onChange={this.handleRuleChange(someRules, option.name)} />
							);
						})
					]
				}
			</Extendable>
		);
	}
	render() {
		return (
			<div>
				{
					Object.keys(this.props.ruleDefinition).map((someRules) => {
						return this.createExtendable(someRules);
					})
				}
			</div>
		);
	}
}

class CreateArticle extends React.Component {
	constructor(props) {
		super(props);
		this.rules = {
			formRules: {
				display: "表單規則",
				checkbox: [],
				textarea: [],
				formRule: [
					{ display: "留言表單格式", name: "commentForm" },
				]
			},
			renderRules: {
				display: "渲染規則",
				checkbox: [],
				textarea: [
					{ display: "留言渲染函式", name: "renderComment" },
				]
			},
			backendRules: {
				display: "權限限制",
				checkbox: [],
				textarea: [
					{ display: "閱讀文章", name: "onEnter" },
					{ display: "留言", name: "onComment" },
				]
			}
		};
		this.state = {
			title: "",
			articleContent: [], // TODO: 待處理，需取得 articleForm
			rules: ruleToState(this.rules),
		};
		this.handleTitleChange = this.handleTitleChange.bind(this);
		this.handleContentChange = this.handleContentChange.bind(this);
		this.handleOnSubmit = this.handleOnSubmit.bind(this);
		this.setRules = this.setRules.bind(this);
	}
	handleTitleChange(event) {
		this.setState({
			title: event.target.value
		});
	}
	// TODO: 需符合 articleForm
	handleContentChange(event) {
		this.setState({
			articleContent: [event.target.value]
		});
	}
	handleOnSubmit() {
		let { title, articleContent, rules } = this.state;
		let article = {
			title,
			articleContent,
			formRules: rules.get("formRules").toObject(),
			renderRules: rules.get("renderRules").toObject(),
			backendRules: rules.get("backendRules").toObject()
		};
		console.log(article);
		// TODO: 打開下面一行
		// this.props.newArticle(article);
	}
	setRules(rules) {
		this.setState({
			rules: rules
		});
	}
	render() {
		return (
			<div>
				<div className="field" style={{marginBottom: "35px"}}>
					<label className="label">標題</label>
					<div className="control">
						<input
							onChange={this.handleTitleChange}
							className="input"
							type="text"
							placeholder="標題" />
					</div>
				</div>
				<div className="field" style={{marginBottom: "35px"}}>
					<label className="label">文章內容</label>
					<div className="control">
						<textarea
							onChange={this.handleContentChange}
							className="textarea"
							placeholder="文章內容" />
					</div>
				</div>
				<RuleGroup
					ruleDefinition={this.rules}
					ruleState={this.state.rules}
					setRules={this.setRules}/>
				<div className="field">
					<div className="control">
						<button onClick={this.handleOnSubmit} className="button is-primary">送出</button>
					</div>
				</div>
			</div>
		);
	}
}

class CreateBoard extends React.Component {
	constructor(props) {
		super(props);
		this.rules = {
			formRules: {
				display: "表單規則",
				checkbox: [
					{ display: "可定義文章表單", name: "canDefArticleForm" },
					{ display: "可定義留言表單", name: "canDefCommentForm" },
				],
				textarea: [
					{ display: "文章表單格式", name: "articleForm" },
					{ display: "留言表單格式", name: "commentForm" },
				]
			},
			renderRules: {
				display: "渲染規則",
				checkbox: [
					{ display: "可定義標題", name: "canDefTitle" },
					{ display: "可定義文章內容", name: "canDefArticleContent" },
					{ display: "可定義留言", name: "canDefComment" },
				],
				textarea: [
					{ display: "標題渲染函式", name: "renderTitle" },
					{ display: "文章內容渲染函式", name: "renderArticleContent" },
					{ display: "留言渲染函式", name: "renderComment" },
				]
			},
			backendRules: {
				display: "權限限制",
				checkbox: [],
				textarea: [
					{ display: "進入看板（文章）", name: "onEnter" },
					{ display: "創建看板", name: "onNewBoard" },
					{ display: "發文", name: "onNewArticle" },
					{ display: "留言", name: "onComment" },
				]
			}
		};
		this.state = {
			name: "",
			show: Map({
				formRules: false,
				renderRules: false,
				backendRules: false
			})
		};
		this.handleNameChange = this.handleNameChange.bind(this);
		this.handleOnSubmit = this.handleOnSubmit.bind(this)	;
	}
	handleNameChange(event) {
		this.setState({
			name: event.target.value
		});
	}
	handleOnSubmit() {
		let { name, rules } = this.state;
		let board = {
			name,
			formRules: rules.get("formRules").toObject(),
			renderRules: rules.get("renderRules").toObject(),
			backendRules: rules.get("backendRules").toObject()
		};
		this.props.newBoard(board);
	}
	render() {
		return (
			<div>
				<div className="field" style={{marginBottom: "35px"}}>
					<label className="label">看板名稱</label>
					<div className="control">
						<input onChange={this.handleNameChange} className="input" type="text" placeholder="看板名稱" />
					</div>
				</div>
				{/* { this.extendableGroup("formRules") }
				{ this.extendableGroup("renderRules") }
				{ this.extendableGroup("backendRules") } */}
				<div className="field">
					<div className="control">
						<button onClick={this.handleOnSubmit} className="button is-primary">送出</button>
					</div>
				</div>
			</div>
		);
	}
}

class Board extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showSource: false,
			creatingAritcle: false,
			creatingBoard: false,
			boards: [],
			articles: [],
			showBoard: false,
			showArticle: false,
		};
		this.newBoard = this.newBoard.bind(this);
		this.newArticle = this.newArticle.bind(this);
	}
	countPath() {
		const urlPath = this.props.location.pathname;
		const path = urlPath.split("/").slice(2).filter((ele, index) => index % 2 == 1);
		return path;
	}
	componentDidMount() {
		this.getBoardData();
	}
	componentDidUpdate(prevProps, prevState) {
		if (prevProps.location.pathname != this.props.location.pathname) {
			this.getBoardData();
		}
	}
	getBoardData() {
		const path = this.countPath();
		const url = (path.length == 0) ? "/api/board/browse" : `/api/board/browse?name=${path.join(",")}`;
		console.log(url);
		fetch(url, {
			credentials: "same-origin"
		}).then((res) => {
			if (res.ok) {
				res.json().then((data) => {
					switch (data) {
						case "FAIL":
							console.log("取得看板資料失敗");
							break;
						default:
							console.log("取得看板資料成功");
							console.log(data);
							this.boardID = data.board._id;
							const boards = data.b_list;
							const articles = data.a_list;
							const showBoard = boards.length >= articles.length;
							const showArticle = !showBoard;
							this.setState({
								boards, articles, showBoard, showArticle
							});
					}
				});
			} else {
				console.log("取得看板資料：非正常失敗");
			}
		}, (err) => {
			console.log("AJAX失敗，取得看板資料失敗");
		});
	}
	newArticle(articleDefinition) {
		let body = articleDefinition;
		body.board = this.boardID;
		fetch("/api/article/new", {
			method: "POST",
			credentials: "same-origin",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body)
		}).then((res) => {
			if (res.ok) {
				res.text().then((data) => {
					switch (data) {
						case "FAIL":
							console.log("發文失敗");
							break;
						case "OK":
							console.log("發文成功");
							break;
						case "尚未登入":
							console.log("尚未登入");
							break;
					}
				});
			} else {
				console.log("發文：非正常失敗");
			}
		}, (err) => {
			console.log("AJAX失敗，發文失敗");
		});
	}
	newBoard(boardDefinition) {
		let body = boardDefinition;
		body.parent = this.boardID;
		fetch("/api/board/new", {
			method: "POST",
			credentials: "same-origin",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body)
		}).then((res) => {
			if (res.ok) {
				res.text().then((data) => {
					switch (data) {
						case "FAIL":
							console.log("創建看板失敗");
							break;
						case "OK":
							console.log("創建看板成功");
							break;
						case "尚未登入":
							console.log("尚未登入");
							break;
					}
				});
			} else {
				console.log("創建看板：非正常失敗");
			}
		}, (err) => {
			console.log("AJAX失敗，創建看板失敗");
		});
	}
	render() {
		const location = this.props.location;
		return (
			<div>
				<div style={{fontSize: "24px", marginBottom: "30px"}}>
					當前看板：
					{
						(() => {
							let urlPath = "/app";
							let result = [
								<Link key={urlPath} to={urlPath}><span>根</span></Link>
							];
							for (let boardName of this.countPath()) {
								urlPath += `/b/${boardName}`;
								result.push(<span key={urlPath + "/"}> / </span>);
								result.push(<Link key={urlPath} to={urlPath}><span>{boardName}</span></Link>);
							}
							return result;
						})()
					}
				</div>
				<div style={{ marginBottom: "30px" }}>
					<a className={this.state.creatingAritcle ? "button is-success" : "button"}
						style={{ marginBottom: "15px", marginRight: "12px" }}
						onClick={() => {this.setState({creatingAritcle: !this.state.creatingAritcle});}}>
						發文
					</a>
					<a className={this.state.creatingBoard ? "button is-success" : "button"}
						style={{ marginBottom: "15px", marginRight: "12px" }}
						onClick={() => {this.setState({creatingBoard: !this.state.creatingBoard});}}>
						創建新板
					</a>
					<a className={this.state.showSource ? "button is-success" : "button"}
						style={{ marginBottom: "15px" }}
						onClick={() => {this.setState({showSource: !this.state.showSource});}}>
						觀看看板源碼
					</a>
				</div>
				{
					(() => {
						if (this.state.creatingAritcle) {
							return (
								<div className="box" style={{ marginBottom: "30px" }}>
									<h4 className="title is-4">發文</h4>
									<CreateArticle newArticle={this.newArticle} />
								</div>
							);
						}
					})()
				}
				{
					(() => {
						if (this.state.creatingBoard) {
							return (
								<div className="box" style={{ marginBottom: "30px" }}>
									<h4 className="title is-4">創建新版</h4>
									<CreateBoard newBoard={this.newBoard} />
								</div>
							);
						}
					})()
				}
				{
					(() => {
						if (this.state.showSource) {
							return (
								<div style={{ marginBottom: "30px" }}>
									<p>源碼</p>
								</div>
							);
						}
					})()
				}
				<div style={{marginBottom: "30px"}}>
					<h5 className="title is-5">
						<span>看板 </span>
						<a onClick={() => {this.setState({showBoard: !this.state.showBoard});}}>
							{this.state.showBoard ? "收起" : "展開"}
						</a>
					</h5>
					{
						(() => {
							if (this.state.showBoard) {
								return this.state.boards.map((board) => {
									return (
										<div key={board.name}>
											<Link to={location.pathname + "/b/" + board.name}>{board.name}</Link>
										</div>
									);
								});
							} else {
								return;
							}
						})()
					}
				</div>
				<div style={{marginBottom: "30px"}}>
					<h5 className="title is-5">
						<span>文章 </span>
						<a onClick={() => {this.setState({showArticle: !this.state.showArticle});}}>
							{this.state.showArticle ? "收起" : "展開"}
						</a>
					</h5>
					{
						(() => {
							if (this.state.showArticle) {
								return this.state.articles.map((article) => {
									return (
										<div key={article._id}>
											<Link to={`${location.pathname}/a/${article.title}?id=${article._id}`}>{article.title}</Link>
										</div>
									);
								});
							} else {
								return;
							}
						})()
					}
				</div>
			</div>
		);
	}
}

export default Board;