let router = require("express").Router();
let _ = require("lodash");
let { createBoard, getList } = require("./board.js");
let { recursiveGetBoard, getRootId } = require("../util/db_util.js");
let { checkBoardDescription } = require("../../isomorphic/checkAPI.js");

router.get("/browse", async function(req, res) {
	try {
		let max = Number(req.query.max) || 10000;
		let names = [];
		if (req.query.name) {
			names = req.query.name.split(",");
		}
		let root_id = req.query.base;
		if (!root_id) {
			root_id = await getRootId();
		}
		let board = await recursiveGetBoard(root_id, names);
		let list = await getList(board, max, req.session.user_id);
		if(list.err_msg) {
			res.status(403).send(list.err_msg);
		}
		else {
			res.json(list);
		}
	} catch (err) {
		console.log(err);
		if(_.isString(err)) { // 自定的錯誤
			res.status(404).send(err);
		} else {
			res.status(500).send("FAIL");
		}
	}
});

router.post("/new", async function(req, res) {
	let user_id= req.session.user_id;
	try {
		if (!user_id) {
			res.status(401).send("尚未登入");
		} else if (!checkBoardDescription(req.body.description)) {
			res.status(403).send("看板簡介字數過多");
		} else {
			let query = req.body;
			let new_b = await createBoard(user_id, query.name, query.parent,
				query.description, query.formRules, query.renderRules, query.backendRules);
			if(new_b.err_msg) {
				res.status(403).send(new_b.err_msg);
			} else {
				res.json(new_b);
			}
		}
	} catch(err) {
		console.log(err);
		if(_.isString(err)) { // 自定的錯誤
			res.status(400).send(err);
		} else {
			res.status(500).send("FAIL");
		}
	}
});

module.exports = router;
