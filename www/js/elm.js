
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode = _elm_lang$core$Json_Decode$succeed;
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$resolve = _elm_lang$core$Json_Decode$andThen(_elm_lang$core$Basics$identity);
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom = _elm_lang$core$Json_Decode$map2(
	F2(
		function (x, y) {
			return y(x);
		}));
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$hardcoded = function (_p0) {
	return _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom(
		_elm_lang$core$Json_Decode$succeed(_p0));
};
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalDecoder = F3(
	function (pathDecoder, valDecoder, fallback) {
		var nullOr = function (decoder) {
			return _elm_lang$core$Json_Decode$oneOf(
				{
					ctor: '::',
					_0: decoder,
					_1: {
						ctor: '::',
						_0: _elm_lang$core$Json_Decode$null(fallback),
						_1: {ctor: '[]'}
					}
				});
		};
		var handleResult = function (input) {
			var _p1 = A2(_elm_lang$core$Json_Decode$decodeValue, pathDecoder, input);
			if (_p1.ctor === 'Ok') {
				var _p2 = A2(
					_elm_lang$core$Json_Decode$decodeValue,
					nullOr(valDecoder),
					_p1._0);
				if (_p2.ctor === 'Ok') {
					return _elm_lang$core$Json_Decode$succeed(_p2._0);
				} else {
					return _elm_lang$core$Json_Decode$fail(_p2._0);
				}
			} else {
				return _elm_lang$core$Json_Decode$succeed(fallback);
			}
		};
		return A2(_elm_lang$core$Json_Decode$andThen, handleResult, _elm_lang$core$Json_Decode$value);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalAt = F4(
	function (path, valDecoder, fallback, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalDecoder,
				A2(_elm_lang$core$Json_Decode$at, path, _elm_lang$core$Json_Decode$value),
				valDecoder,
				fallback),
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional = F4(
	function (key, valDecoder, fallback, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalDecoder,
				A2(_elm_lang$core$Json_Decode$field, key, _elm_lang$core$Json_Decode$value),
				valDecoder,
				fallback),
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$requiredAt = F3(
	function (path, valDecoder, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A2(_elm_lang$core$Json_Decode$at, path, valDecoder),
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required = F3(
	function (key, valDecoder, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A2(_elm_lang$core$Json_Decode$field, key, valDecoder),
			decoder);
	});

var _Zinggi$elm_webgl_math$Vector2$dot = F2(
	function (_p1, _p0) {
		var _p2 = _p1;
		var _p3 = _p0;
		return (_p2._0 * _p3._0) + (_p2._1 * _p3._1);
	});
var _Zinggi$elm_webgl_math$Vector2$length = function (v) {
	return _elm_lang$core$Basics$sqrt(
		A2(_Zinggi$elm_webgl_math$Vector2$dot, v, v));
};
var _Zinggi$elm_webgl_math$Vector2$lengthSquared = function (v) {
	return A2(_Zinggi$elm_webgl_math$Vector2$dot, v, v);
};
var _Zinggi$elm_webgl_math$Vector2$angle = F2(
	function (v, w) {
		var r = A2(_Zinggi$elm_webgl_math$Vector2$dot, v, w) / (_Zinggi$elm_webgl_math$Vector2$length(v) * _Zinggi$elm_webgl_math$Vector2$length(w));
		return (_elm_lang$core$Native_Utils.cmp(r, 1) > -1) ? 0 : _elm_lang$core$Basics$acos(r);
	});
var _Zinggi$elm_webgl_math$Vector2$divideBy = F2(
	function (a, _p4) {
		var _p5 = _p4;
		return {ctor: '_Tuple2', _0: _p5._0 / a, _1: _p5._1 / a};
	});
var _Zinggi$elm_webgl_math$Vector2$normalize = function (v) {
	return A2(
		_Zinggi$elm_webgl_math$Vector2$divideBy,
		_Zinggi$elm_webgl_math$Vector2$length(v),
		v);
};
var _Zinggi$elm_webgl_math$Vector2$scale = F2(
	function (a, _p6) {
		var _p7 = _p6;
		return {ctor: '_Tuple2', _0: a * _p7._0, _1: a * _p7._1};
	});
var _Zinggi$elm_webgl_math$Vector2$project = F2(
	function (v, w) {
		var l_w = _Zinggi$elm_webgl_math$Vector2$lengthSquared(w);
		return A2(
			_Zinggi$elm_webgl_math$Vector2$scale,
			A2(_Zinggi$elm_webgl_math$Vector2$dot, v, w) / l_w,
			w);
	});
var _Zinggi$elm_webgl_math$Vector2$negate = function (_p8) {
	var _p9 = _p8;
	return {ctor: '_Tuple2', _0: 0 - _p9._0, _1: 0 - _p9._1};
};
var _Zinggi$elm_webgl_math$Vector2$sub = F2(
	function (_p11, _p10) {
		var _p12 = _p11;
		var _p13 = _p10;
		return {ctor: '_Tuple2', _0: _p12._0 - _p13._0, _1: _p12._1 - _p13._1};
	});
var _Zinggi$elm_webgl_math$Vector2$reject = F2(
	function (v, w) {
		return A2(
			_Zinggi$elm_webgl_math$Vector2$sub,
			v,
			A2(_Zinggi$elm_webgl_math$Vector2$project, v, w));
	});
var _Zinggi$elm_webgl_math$Vector2$directionFromTo = F2(
	function (v, w) {
		return _Zinggi$elm_webgl_math$Vector2$normalize(
			A2(_Zinggi$elm_webgl_math$Vector2$sub, w, v));
	});
var _Zinggi$elm_webgl_math$Vector2$distance = F2(
	function (v, w) {
		return _Zinggi$elm_webgl_math$Vector2$length(
			A2(_Zinggi$elm_webgl_math$Vector2$sub, v, w));
	});
var _Zinggi$elm_webgl_math$Vector2$distanceSquared = F2(
	function (v, w) {
		return _Zinggi$elm_webgl_math$Vector2$lengthSquared(
			A2(_Zinggi$elm_webgl_math$Vector2$sub, v, w));
	});
var _Zinggi$elm_webgl_math$Vector2$add = F2(
	function (_p15, _p14) {
		var _p16 = _p15;
		var _p17 = _p14;
		return {ctor: '_Tuple2', _0: _p16._0 + _p17._0, _1: _p16._1 + _p17._1};
	});
var _Zinggi$elm_webgl_math$Vector2$foldr = F3(
	function (f, start, _p18) {
		var _p19 = _p18;
		return A2(
			f,
			_p19._0,
			A2(f, _p19._1, start));
	});
var _Zinggi$elm_webgl_math$Vector2$foldl = F3(
	function (f, start, _p20) {
		var _p21 = _p20;
		return A2(
			f,
			_p21._1,
			A2(f, _p21._0, start));
	});
var _Zinggi$elm_webgl_math$Vector2$map2 = F3(
	function (op, _p23, _p22) {
		var _p24 = _p23;
		var _p25 = _p22;
		return {
			ctor: '_Tuple2',
			_0: A2(op, _p24._0, _p25._0),
			_1: A2(op, _p24._1, _p25._1)
		};
	});
var _Zinggi$elm_webgl_math$Vector2$map = F2(
	function (f, _p26) {
		var _p27 = _p26;
		return {
			ctor: '_Tuple2',
			_0: f(_p27._0),
			_1: f(_p27._1)
		};
	});
var _Zinggi$elm_webgl_math$Vector2$setY = F2(
	function (a, _p28) {
		var _p29 = _p28;
		return {ctor: '_Tuple2', _0: _p29._0, _1: a};
	});
var _Zinggi$elm_webgl_math$Vector2$setX = F2(
	function (a, _p30) {
		var _p31 = _p30;
		return {ctor: '_Tuple2', _0: a, _1: _p31._1};
	});
var _Zinggi$elm_webgl_math$Vector2$getY = function (_p32) {
	var _p33 = _p32;
	return _p33._1;
};
var _Zinggi$elm_webgl_math$Vector2$getX = function (_p34) {
	var _p35 = _p34;
	return _p35._0;
};

var _Zinggi$elm_webgl_math$Matrix2$mulVector = F2(
	function (_p0, v) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: A2(_Zinggi$elm_webgl_math$Vector2$dot, _p1._0, v),
			_1: A2(_Zinggi$elm_webgl_math$Vector2$dot, _p1._1, v)
		};
	});
var _Zinggi$elm_webgl_math$Matrix2$transpose = function (_p2) {
	var _p3 = _p2;
	return {
		ctor: '_Tuple2',
		_0: {ctor: '_Tuple2', _0: _p3._0._0, _1: _p3._1._0},
		_1: {ctor: '_Tuple2', _0: _p3._0._1, _1: _p3._1._1}
	};
};
var _Zinggi$elm_webgl_math$Matrix2$mulByConst = F2(
	function (a, _p4) {
		var _p5 = _p4;
		return {
			ctor: '_Tuple2',
			_0: {ctor: '_Tuple2', _0: a * _p5._0._0, _1: a * _p5._0._1},
			_1: {ctor: '_Tuple2', _0: a * _p5._1._0, _1: a * _p5._1._1}
		};
	});
var _Zinggi$elm_webgl_math$Matrix2$mul = F2(
	function (_p7, _p6) {
		var _p8 = _p7;
		var _p17 = _p8._1._1;
		var _p16 = _p8._1._0;
		var _p15 = _p8._0._1;
		var _p14 = _p8._0._0;
		var _p9 = _p6;
		var _p13 = _p9._1._1;
		var _p12 = _p9._1._0;
		var _p11 = _p9._0._1;
		var _p10 = _p9._0._0;
		return {
			ctor: '_Tuple2',
			_0: {ctor: '_Tuple2', _0: (_p14 * _p10) + (_p15 * _p12), _1: (_p14 * _p11) + (_p15 * _p13)},
			_1: {ctor: '_Tuple2', _0: (_p16 * _p10) + (_p17 * _p12), _1: (_p16 * _p11) + (_p17 * _p13)}
		};
	});
var _Zinggi$elm_webgl_math$Matrix2$fromColumns = F2(
	function (_p19, _p18) {
		var _p20 = _p19;
		var _p21 = _p18;
		return {
			ctor: '_Tuple2',
			_0: {ctor: '_Tuple2', _0: _p20._0, _1: _p21._0},
			_1: {ctor: '_Tuple2', _0: _p20._1, _1: _p21._1}
		};
	});
var _Zinggi$elm_webgl_math$Matrix2$fromRows = F2(
	function (a, b) {
		return {ctor: '_Tuple2', _0: a, _1: b};
	});
var _Zinggi$elm_webgl_math$Matrix2$identity = {
	ctor: '_Tuple2',
	_0: {ctor: '_Tuple2', _0: 1, _1: 0},
	_1: {ctor: '_Tuple2', _0: 0, _1: 1}
};
var _Zinggi$elm_webgl_math$Matrix2$foldr = F3(
	function (f, init, _p22) {
		var _p23 = _p22;
		return A3(
			_Zinggi$elm_webgl_math$Vector2$foldr,
			f,
			A3(_Zinggi$elm_webgl_math$Vector2$foldr, f, init, _p23._1),
			_p23._0);
	});
var _Zinggi$elm_webgl_math$Matrix2$foldl = F3(
	function (f, init, _p24) {
		var _p25 = _p24;
		return A3(
			_Zinggi$elm_webgl_math$Vector2$foldl,
			f,
			A3(_Zinggi$elm_webgl_math$Vector2$foldl, f, init, _p25._0),
			_p25._1);
	});
var _Zinggi$elm_webgl_math$Matrix2$maxNorm = A2(
	_Zinggi$elm_webgl_math$Matrix2$foldl,
	F2(
		function (elem, acc) {
			return A2(
				_elm_lang$core$Basics$max,
				_elm_lang$core$Basics$abs(elem),
				acc);
		}),
	0);
var _Zinggi$elm_webgl_math$Matrix2$map2 = function (f) {
	return _Zinggi$elm_webgl_math$Vector2$map2(
		_Zinggi$elm_webgl_math$Vector2$map2(f));
};
var _Zinggi$elm_webgl_math$Matrix2$add = _Zinggi$elm_webgl_math$Matrix2$map2(
	F2(
		function (x, y) {
			return x + y;
		}));
var _Zinggi$elm_webgl_math$Matrix2$sub = _Zinggi$elm_webgl_math$Matrix2$map2(
	F2(
		function (x, y) {
			return x - y;
		}));
var _Zinggi$elm_webgl_math$Matrix2$almostEqual = F3(
	function (eps, a, b) {
		return _elm_lang$core$Native_Utils.cmp(
			_Zinggi$elm_webgl_math$Matrix2$maxNorm(
				A2(_Zinggi$elm_webgl_math$Matrix2$sub, a, b)),
			eps) < 1;
	});
var _Zinggi$elm_webgl_math$Matrix2$elementWiseMul = _Zinggi$elm_webgl_math$Matrix2$map2(
	F2(
		function (x, y) {
			return x * y;
		}));
var _Zinggi$elm_webgl_math$Matrix2$map = function (f) {
	return _Zinggi$elm_webgl_math$Vector2$map(
		_Zinggi$elm_webgl_math$Vector2$map(f));
};

var _Zinggi$elm_webgl_math$Vector3$cross = F2(
	function (_p1, _p0) {
		var _p2 = _p1;
		var _p9 = _p2._2;
		var _p8 = _p2._1;
		var _p7 = _p2._0;
		var _p3 = _p0;
		var _p6 = _p3._2;
		var _p5 = _p3._1;
		var _p4 = _p3._0;
		return {ctor: '_Tuple3', _0: (_p8 * _p6) - (_p9 * _p5), _1: (_p9 * _p4) - (_p7 * _p6), _2: (_p7 * _p5) - (_p8 * _p4)};
	});
var _Zinggi$elm_webgl_math$Vector3$dot = F2(
	function (_p11, _p10) {
		var _p12 = _p11;
		var _p13 = _p10;
		return ((_p12._0 * _p13._0) + (_p12._1 * _p13._1)) + (_p12._2 * _p13._2);
	});
var _Zinggi$elm_webgl_math$Vector3$length = function (v) {
	return _elm_lang$core$Basics$sqrt(
		A2(_Zinggi$elm_webgl_math$Vector3$dot, v, v));
};
var _Zinggi$elm_webgl_math$Vector3$lengthSquared = function (v) {
	return A2(_Zinggi$elm_webgl_math$Vector3$dot, v, v);
};
var _Zinggi$elm_webgl_math$Vector3$angle = F2(
	function (a, b) {
		var r = A2(_Zinggi$elm_webgl_math$Vector3$dot, a, b) / (_Zinggi$elm_webgl_math$Vector3$length(a) * _Zinggi$elm_webgl_math$Vector3$length(b));
		return (_elm_lang$core$Native_Utils.cmp(r, 1) > -1) ? 0 : _elm_lang$core$Basics$acos(r);
	});
var _Zinggi$elm_webgl_math$Vector3$divideBy = F2(
	function (a, _p14) {
		var _p15 = _p14;
		return {ctor: '_Tuple3', _0: _p15._0 / a, _1: _p15._1 / a, _2: _p15._2 / a};
	});
var _Zinggi$elm_webgl_math$Vector3$normalize = function (v) {
	return A2(
		_Zinggi$elm_webgl_math$Vector3$divideBy,
		_Zinggi$elm_webgl_math$Vector3$length(v),
		v);
};
var _Zinggi$elm_webgl_math$Vector3$scale = F2(
	function (a, _p16) {
		var _p17 = _p16;
		return {ctor: '_Tuple3', _0: a * _p17._0, _1: a * _p17._1, _2: a * _p17._2};
	});
var _Zinggi$elm_webgl_math$Vector3$project = F2(
	function (v, w) {
		var l_w = _Zinggi$elm_webgl_math$Vector3$lengthSquared(w);
		return A2(
			_Zinggi$elm_webgl_math$Vector3$scale,
			A2(_Zinggi$elm_webgl_math$Vector3$dot, v, w) / l_w,
			w);
	});
var _Zinggi$elm_webgl_math$Vector3$negate = function (_p18) {
	var _p19 = _p18;
	return {ctor: '_Tuple3', _0: 0 - _p19._0, _1: 0 - _p19._1, _2: 0 - _p19._2};
};
var _Zinggi$elm_webgl_math$Vector3$sub = F2(
	function (_p21, _p20) {
		var _p22 = _p21;
		var _p23 = _p20;
		return {ctor: '_Tuple3', _0: _p22._0 - _p23._0, _1: _p22._1 - _p23._1, _2: _p22._2 - _p23._2};
	});
var _Zinggi$elm_webgl_math$Vector3$reject = F2(
	function (v, w) {
		return A2(
			_Zinggi$elm_webgl_math$Vector3$sub,
			v,
			A2(_Zinggi$elm_webgl_math$Vector3$project, v, w));
	});
var _Zinggi$elm_webgl_math$Vector3$directionFromTo = F2(
	function (a, b) {
		return _Zinggi$elm_webgl_math$Vector3$normalize(
			A2(_Zinggi$elm_webgl_math$Vector3$sub, b, a));
	});
var _Zinggi$elm_webgl_math$Vector3$distance = F2(
	function (a, b) {
		return _Zinggi$elm_webgl_math$Vector3$length(
			A2(_Zinggi$elm_webgl_math$Vector3$sub, a, b));
	});
var _Zinggi$elm_webgl_math$Vector3$distanceSquared = F2(
	function (a, b) {
		return _Zinggi$elm_webgl_math$Vector3$lengthSquared(
			A2(_Zinggi$elm_webgl_math$Vector3$sub, a, b));
	});
var _Zinggi$elm_webgl_math$Vector3$add = F2(
	function (_p25, _p24) {
		var _p26 = _p25;
		var _p27 = _p24;
		return {ctor: '_Tuple3', _0: _p26._0 + _p27._0, _1: _p26._1 + _p27._1, _2: _p26._2 + _p27._2};
	});
var _Zinggi$elm_webgl_math$Vector3$foldr = F3(
	function (f, start, _p28) {
		var _p29 = _p28;
		return A2(
			f,
			_p29._0,
			A2(
				f,
				_p29._1,
				A2(f, _p29._2, start)));
	});
var _Zinggi$elm_webgl_math$Vector3$foldl = F3(
	function (f, start, _p30) {
		var _p31 = _p30;
		return A2(
			f,
			_p31._2,
			A2(
				f,
				_p31._1,
				A2(f, _p31._0, start)));
	});
var _Zinggi$elm_webgl_math$Vector3$map2 = F3(
	function (f, _p33, _p32) {
		var _p34 = _p33;
		var _p35 = _p32;
		return {
			ctor: '_Tuple3',
			_0: A2(f, _p34._0, _p35._0),
			_1: A2(f, _p34._1, _p35._1),
			_2: A2(f, _p34._2, _p35._2)
		};
	});
var _Zinggi$elm_webgl_math$Vector3$map = F2(
	function (f, _p36) {
		var _p37 = _p36;
		return {
			ctor: '_Tuple3',
			_0: f(_p37._0),
			_1: f(_p37._1),
			_2: f(_p37._2)
		};
	});
var _Zinggi$elm_webgl_math$Vector3$setZ = F2(
	function (a, _p38) {
		var _p39 = _p38;
		return {ctor: '_Tuple3', _0: _p39._0, _1: _p39._1, _2: a};
	});
var _Zinggi$elm_webgl_math$Vector3$setY = F2(
	function (a, _p40) {
		var _p41 = _p40;
		return {ctor: '_Tuple3', _0: _p41._0, _1: a, _2: _p41._2};
	});
var _Zinggi$elm_webgl_math$Vector3$setX = F2(
	function (a, _p42) {
		var _p43 = _p42;
		return {ctor: '_Tuple3', _0: a, _1: _p43._1, _2: _p43._2};
	});
var _Zinggi$elm_webgl_math$Vector3$getZ = function (_p44) {
	var _p45 = _p44;
	return _p45._2;
};
var _Zinggi$elm_webgl_math$Vector3$getY = function (_p46) {
	var _p47 = _p46;
	return _p47._1;
};
var _Zinggi$elm_webgl_math$Vector3$getX = function (_p48) {
	var _p49 = _p48;
	return _p49._0;
};
var _Zinggi$elm_webgl_math$Vector3$fromV2 = F2(
	function (_p50, z) {
		var _p51 = _p50;
		return {ctor: '_Tuple3', _0: _p51._0, _1: _p51._1, _2: z};
	});

var _Zinggi$elm_webgl_math$Vector4$dot = F2(
	function (_p1, _p0) {
		var _p2 = _p1;
		var _p3 = _p0;
		return (((_p2._0 * _p3._0) + (_p2._1 * _p3._1)) + (_p2._2 * _p3._2)) + (_p2._3 * _p3._3);
	});
var _Zinggi$elm_webgl_math$Vector4$length = function (v) {
	return _elm_lang$core$Basics$sqrt(
		A2(_Zinggi$elm_webgl_math$Vector4$dot, v, v));
};
var _Zinggi$elm_webgl_math$Vector4$lengthSquared = function (v) {
	return A2(_Zinggi$elm_webgl_math$Vector4$dot, v, v);
};
var _Zinggi$elm_webgl_math$Vector4$angle = F2(
	function (a, b) {
		var r = A2(_Zinggi$elm_webgl_math$Vector4$dot, a, b) / (_Zinggi$elm_webgl_math$Vector4$length(a) * _Zinggi$elm_webgl_math$Vector4$length(b));
		return (_elm_lang$core$Native_Utils.cmp(r, 1) > -1) ? 0 : _elm_lang$core$Basics$acos(r);
	});
var _Zinggi$elm_webgl_math$Vector4$divideBy = F2(
	function (a, _p4) {
		var _p5 = _p4;
		return {ctor: '_Tuple4', _0: _p5._0 / a, _1: _p5._1 / a, _2: _p5._2 / a, _3: _p5._3 / a};
	});
var _Zinggi$elm_webgl_math$Vector4$normalize = function (v) {
	return A2(
		_Zinggi$elm_webgl_math$Vector4$divideBy,
		_Zinggi$elm_webgl_math$Vector4$length(v),
		v);
};
var _Zinggi$elm_webgl_math$Vector4$scale = F2(
	function (a, _p6) {
		var _p7 = _p6;
		return {ctor: '_Tuple4', _0: a * _p7._0, _1: a * _p7._1, _2: a * _p7._2, _3: a * _p7._3};
	});
var _Zinggi$elm_webgl_math$Vector4$negate = function (_p8) {
	var _p9 = _p8;
	return {ctor: '_Tuple4', _0: 0 - _p9._0, _1: 0 - _p9._1, _2: 0 - _p9._2, _3: 0 - _p9._3};
};
var _Zinggi$elm_webgl_math$Vector4$sub = F2(
	function (_p11, _p10) {
		var _p12 = _p11;
		var _p13 = _p10;
		return {ctor: '_Tuple4', _0: _p12._0 - _p13._0, _1: _p12._1 - _p13._1, _2: _p12._2 - _p13._2, _3: _p12._3 - _p13._3};
	});
var _Zinggi$elm_webgl_math$Vector4$directionFromTo = F2(
	function (a, b) {
		return _Zinggi$elm_webgl_math$Vector4$normalize(
			A2(_Zinggi$elm_webgl_math$Vector4$sub, b, a));
	});
var _Zinggi$elm_webgl_math$Vector4$distance = F2(
	function (a, b) {
		return _Zinggi$elm_webgl_math$Vector4$length(
			A2(_Zinggi$elm_webgl_math$Vector4$sub, a, b));
	});
var _Zinggi$elm_webgl_math$Vector4$distanceSquared = F2(
	function (a, b) {
		return _Zinggi$elm_webgl_math$Vector4$lengthSquared(
			A2(_Zinggi$elm_webgl_math$Vector4$sub, a, b));
	});
var _Zinggi$elm_webgl_math$Vector4$add = F2(
	function (_p15, _p14) {
		var _p16 = _p15;
		var _p17 = _p14;
		return {ctor: '_Tuple4', _0: _p16._0 + _p17._0, _1: _p16._1 + _p17._1, _2: _p16._2 + _p17._2, _3: _p16._3 + _p17._3};
	});
var _Zinggi$elm_webgl_math$Vector4$foldr = F3(
	function (f, start, _p18) {
		var _p19 = _p18;
		return A2(
			f,
			_p19._0,
			A2(
				f,
				_p19._1,
				A2(
					f,
					_p19._2,
					A2(f, _p19._3, start))));
	});
var _Zinggi$elm_webgl_math$Vector4$foldl = F3(
	function (f, start, _p20) {
		var _p21 = _p20;
		return A2(
			f,
			_p21._3,
			A2(
				f,
				_p21._2,
				A2(
					f,
					_p21._1,
					A2(f, _p21._0, start))));
	});
var _Zinggi$elm_webgl_math$Vector4$map2 = F3(
	function (f, _p23, _p22) {
		var _p24 = _p23;
		var _p25 = _p22;
		return {
			ctor: '_Tuple4',
			_0: A2(f, _p24._0, _p25._0),
			_1: A2(f, _p24._1, _p25._1),
			_2: A2(f, _p24._2, _p25._2),
			_3: A2(f, _p24._3, _p25._3)
		};
	});
var _Zinggi$elm_webgl_math$Vector4$map = F2(
	function (f, _p26) {
		var _p27 = _p26;
		return {
			ctor: '_Tuple4',
			_0: f(_p27._0),
			_1: f(_p27._1),
			_2: f(_p27._2),
			_3: f(_p27._3)
		};
	});
var _Zinggi$elm_webgl_math$Vector4$setW = F2(
	function (a, _p28) {
		var _p29 = _p28;
		return {ctor: '_Tuple4', _0: _p29._0, _1: _p29._1, _2: _p29._2, _3: a};
	});
var _Zinggi$elm_webgl_math$Vector4$setZ = F2(
	function (a, _p30) {
		var _p31 = _p30;
		return {ctor: '_Tuple4', _0: _p31._0, _1: _p31._1, _2: a, _3: _p31._3};
	});
var _Zinggi$elm_webgl_math$Vector4$setY = F2(
	function (a, _p32) {
		var _p33 = _p32;
		return {ctor: '_Tuple4', _0: _p33._0, _1: a, _2: _p33._2, _3: _p33._3};
	});
var _Zinggi$elm_webgl_math$Vector4$setX = F2(
	function (a, _p34) {
		var _p35 = _p34;
		return {ctor: '_Tuple4', _0: a, _1: _p35._1, _2: _p35._2, _3: _p35._3};
	});
var _Zinggi$elm_webgl_math$Vector4$getW = function (_p36) {
	var _p37 = _p36;
	return _p37._3;
};
var _Zinggi$elm_webgl_math$Vector4$getZ = function (_p38) {
	var _p39 = _p38;
	return _p39._2;
};
var _Zinggi$elm_webgl_math$Vector4$getY = function (_p40) {
	var _p41 = _p40;
	return _p41._1;
};
var _Zinggi$elm_webgl_math$Vector4$getX = function (_p42) {
	var _p43 = _p42;
	return _p43._0;
};
var _Zinggi$elm_webgl_math$Vector4$fromV3 = F2(
	function (_p44, w) {
		var _p45 = _p44;
		return {ctor: '_Tuple4', _0: _p45._0, _1: _p45._1, _2: _p45._2, _3: w};
	});

var _Zinggi$elm_webgl_math$Matrix4$makeOrtho = F6(
	function (left, right, bottom, top, znear, zfar) {
		var _p0 = {ctor: '_Tuple3', _0: right - left, _1: top - bottom, _2: zfar - znear};
		var r_l = _p0._0;
		var t_b = _p0._1;
		var zf_zn = _p0._2;
		return {
			ctor: '_Tuple4',
			_0: {ctor: '_Tuple4', _0: 2 / r_l, _1: 0, _2: 0, _3: (0 - (right + left)) / r_l},
			_1: {ctor: '_Tuple4', _0: 0, _1: 2 / t_b, _2: 0, _3: (0 - (top + bottom)) / t_b},
			_2: {ctor: '_Tuple4', _0: 0, _1: 0, _2: -2 / zf_zn, _3: (0 - (zfar + znear)) / zf_zn},
			_3: {ctor: '_Tuple4', _0: 0, _1: 0, _2: 0, _3: 1}
		};
	});
var _Zinggi$elm_webgl_math$Matrix4$makeOrtho2d = F4(
	function (left, right, bottom, top) {
		return A6(_Zinggi$elm_webgl_math$Matrix4$makeOrtho, left, right, bottom, top, -1, 1);
	});
var _Zinggi$elm_webgl_math$Matrix4$makeFrustum = F6(
	function (left, right, bottom, top, znear, zfar) {
		var _p1 = {ctor: '_Tuple4', _0: right - left, _1: top - bottom, _2: zfar - znear, _3: 2 * znear};
		var r_l = _p1._0;
		var t_b = _p1._1;
		var zf_zn = _p1._2;
		var zn_2 = _p1._3;
		return {
			ctor: '_Tuple4',
			_0: {ctor: '_Tuple4', _0: zn_2 / r_l, _1: 0, _2: (right + left) / r_l, _3: 0},
			_1: {ctor: '_Tuple4', _0: 0, _1: zn_2 / t_b, _2: (top + bottom) / t_b, _3: 0},
			_2: {ctor: '_Tuple4', _0: 0, _1: 0, _2: (0 - (zfar + znear)) / zf_zn, _3: ((0 - zn_2) * zfar) / zf_zn},
			_3: {ctor: '_Tuple4', _0: 0, _1: 0, _2: -1, _3: 0}
		};
	});
var _Zinggi$elm_webgl_math$Matrix4$makePerspective = F4(
	function (fovy, aspect, znear, zfar) {
		var ymax = znear * _elm_lang$core$Basics$tan((fovy * _elm_lang$core$Basics$pi) / 360.0);
		var ymin = 0 - ymax;
		var _p2 = {ctor: '_Tuple2', _0: ymin * aspect, _1: ymax * aspect};
		var xmin = _p2._0;
		var xmax = _p2._1;
		return A6(_Zinggi$elm_webgl_math$Matrix4$makeFrustum, xmin, xmax, ymin, ymax, znear, zfar);
	});
var _Zinggi$elm_webgl_math$Matrix4$inverseRigidBodyTransform = function (_p3) {
	var _p4 = _p3;
	var _p16 = _p4._2._3;
	var _p15 = _p4._1._3;
	var _p14 = _p4._0._3;
	var _p13 = _p4._2._2;
	var _p12 = _p4._2._1;
	var _p11 = _p4._2._0;
	var _p10 = _p4._1._2;
	var _p9 = _p4._1._1;
	var _p8 = _p4._1._0;
	var _p7 = _p4._0._2;
	var _p6 = _p4._0._1;
	var _p5 = _p4._0._0;
	return {
		ctor: '_Tuple4',
		_0: {ctor: '_Tuple4', _0: _p5, _1: _p8, _2: _p11, _3: (((0 - _p5) * _p14) - (_p8 * _p15)) - (_p11 * _p16)},
		_1: {ctor: '_Tuple4', _0: _p6, _1: _p9, _2: _p12, _3: (((0 - _p6) * _p14) - (_p9 * _p15)) - (_p12 * _p16)},
		_2: {ctor: '_Tuple4', _0: _p7, _1: _p10, _2: _p13, _3: (((0 - _p7) * _p14) - (_p10 * _p15)) - (_p13 * _p16)},
		_3: _p4._3
	};
};
var _Zinggi$elm_webgl_math$Matrix4$mulAffine = F2(
	function (_p18, _p17) {
		var _p19 = _p18;
		var _p41 = _p19._2._2;
		var _p40 = _p19._2._1;
		var _p39 = _p19._2._0;
		var _p38 = _p19._1._2;
		var _p37 = _p19._1._1;
		var _p36 = _p19._1._0;
		var _p35 = _p19._0._2;
		var _p34 = _p19._0._1;
		var _p33 = _p19._0._0;
		var _p20 = _p17;
		var _p32 = _p20._2._3;
		var _p31 = _p20._2._2;
		var _p30 = _p20._2._1;
		var _p29 = _p20._2._0;
		var _p28 = _p20._1._3;
		var _p27 = _p20._1._2;
		var _p26 = _p20._1._1;
		var _p25 = _p20._1._0;
		var _p24 = _p20._0._3;
		var _p23 = _p20._0._2;
		var _p22 = _p20._0._1;
		var _p21 = _p20._0._0;
		return {
			ctor: '_Tuple4',
			_0: {ctor: '_Tuple4', _0: ((_p33 * _p21) + (_p34 * _p25)) + (_p35 * _p29), _1: ((_p33 * _p22) + (_p34 * _p26)) + (_p35 * _p30), _2: ((_p33 * _p23) + (_p34 * _p27)) + (_p35 * _p31), _3: (((_p33 * _p24) + (_p34 * _p28)) + (_p35 * _p32)) + _p19._0._3},
			_1: {ctor: '_Tuple4', _0: ((_p36 * _p21) + (_p37 * _p25)) + (_p38 * _p29), _1: ((_p36 * _p22) + (_p37 * _p26)) + (_p38 * _p30), _2: ((_p36 * _p23) + (_p37 * _p27)) + (_p38 * _p31), _3: (((_p36 * _p24) + (_p37 * _p28)) + (_p38 * _p32)) + _p19._1._3},
			_2: {ctor: '_Tuple4', _0: ((_p39 * _p21) + (_p40 * _p25)) + (_p41 * _p29), _1: ((_p39 * _p22) + (_p40 * _p26)) + (_p41 * _p30), _2: ((_p39 * _p23) + (_p40 * _p27)) + (_p41 * _p31), _3: (((_p39 * _p24) + (_p40 * _p28)) + (_p41 * _p32)) + _p19._2._3},
			_3: {ctor: '_Tuple4', _0: 0, _1: 0, _2: 0, _3: 1}
		};
	});
var _Zinggi$elm_webgl_math$Matrix4$transformAffine = F2(
	function (_p43, _p42) {
		var _p44 = _p43;
		var _p45 = _p42;
		var _p48 = _p45._2;
		var _p47 = _p45._1;
		var _p46 = _p45._0;
		return {ctor: '_Tuple3', _0: (((_p44._0._0 * _p46) + (_p44._0._1 * _p47)) + (_p44._0._2 * _p48)) + _p44._0._3, _1: (((_p44._1._0 * _p46) + (_p44._1._1 * _p47)) + (_p44._1._2 * _p48)) + _p44._1._3, _2: (((_p44._2._0 * _p46) + (_p44._2._1 * _p47)) + (_p44._2._2 * _p48)) + _p44._2._3};
	});
var _Zinggi$elm_webgl_math$Matrix4$makeTransform = F5(
	function (_p51, _p50, angle, axis, _p49) {
		var _p52 = _p51;
		var _p53 = _p50;
		var _p68 = _p53._2;
		var _p67 = _p53._1;
		var _p66 = _p53._0;
		var _p54 = _p49;
		var _p65 = _p54._2;
		var _p64 = _p54._1;
		var _p63 = _p54._0;
		var _p55 = _Zinggi$elm_webgl_math$Vector3$normalize(axis);
		var rx = _p55._0;
		var ry = _p55._1;
		var rz = _p55._2;
		var _p56 = {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Basics$cos(angle),
			_1: _elm_lang$core$Basics$sin(angle)
		};
		var c = _p56._0;
		var s = _p56._1;
		var c1 = 1 - c;
		var _p57 = {ctor: '_Tuple2', _0: rx * c1, _1: ry * c1};
		var rxc1 = _p57._0;
		var ryc1 = _p57._1;
		var _p58 = {ctor: '_Tuple3', _0: ry * rxc1, _1: rz * rxc1, _2: rz * ryc1};
		var ryxc1 = _p58._0;
		var rzxc1 = _p58._1;
		var rzyc1 = _p58._2;
		var _p59 = {ctor: '_Tuple3', _0: rx * s, _1: ry * s, _2: rz * s};
		var rxs = _p59._0;
		var rys = _p59._1;
		var rzs = _p59._2;
		var _p60 = {ctor: '_Tuple3', _0: _p66 * ((rx * rxc1) + c), _1: _p66 * (ryxc1 + rzs), _2: _p66 * (rzxc1 - rys)};
		var new_x1 = _p60._0;
		var new_x2 = _p60._1;
		var new_x3 = _p60._2;
		var _p61 = {ctor: '_Tuple3', _0: _p67 * (ryxc1 - rzs), _1: _p67 * ((ry * ryc1) + c), _2: _p67 * (rzyc1 + rxs)};
		var new_y1 = _p61._0;
		var new_y2 = _p61._1;
		var new_y3 = _p61._2;
		var _p62 = {ctor: '_Tuple3', _0: _p68 * (rzxc1 + rys), _1: _p68 * (rzyc1 - rxs), _2: _p68 * (((rz * rz) * c1) + c)};
		var new_z1 = _p62._0;
		var new_z2 = _p62._1;
		var new_z3 = _p62._2;
		return {
			ctor: '_Tuple4',
			_0: {ctor: '_Tuple4', _0: new_x1, _1: new_y1, _2: new_z1, _3: ((((0 - _p63) * new_x1) - (_p64 * new_y1)) - (_p65 * new_z1)) + _p52._0},
			_1: {ctor: '_Tuple4', _0: new_x2, _1: new_y2, _2: new_z2, _3: ((((0 - _p63) * new_x2) - (_p64 * new_y2)) - (_p65 * new_z2)) + _p52._1},
			_2: {ctor: '_Tuple4', _0: new_x3, _1: new_y3, _2: new_z3, _3: ((((0 - _p63) * new_x3) - (_p64 * new_y3)) - (_p65 * new_z3)) + _p52._2},
			_3: {ctor: '_Tuple4', _0: 0, _1: 0, _2: 0, _3: 1}
		};
	});
var _Zinggi$elm_webgl_math$Matrix4$transformBy = F5(
	function (translation, scale, angle, axis, pivot) {
		return _Zinggi$elm_webgl_math$Matrix4$transformAffine(
			A5(_Zinggi$elm_webgl_math$Matrix4$makeTransform, translation, scale, angle, axis, pivot));
	});
var _Zinggi$elm_webgl_math$Matrix4$makeLookAt = F3(
	function (eye, target, up) {
		var _p69 = _Zinggi$elm_webgl_math$Vector3$normalize(
			A2(_Zinggi$elm_webgl_math$Vector3$sub, eye, target));
		var z = _p69;
		var z0 = _p69._0;
		var z1 = _p69._1;
		var z2 = _p69._2;
		var _p70 = _Zinggi$elm_webgl_math$Vector3$normalize(
			A2(_Zinggi$elm_webgl_math$Vector3$cross, up, z));
		var x = _p70;
		var x0 = _p70._0;
		var x1 = _p70._1;
		var x2 = _p70._2;
		var _p71 = _Zinggi$elm_webgl_math$Vector3$normalize(
			A2(_Zinggi$elm_webgl_math$Vector3$cross, z, x));
		var y = _p71;
		var y0 = _p71._0;
		var y1 = _p71._1;
		var y2 = _p71._2;
		return {
			ctor: '_Tuple4',
			_0: {
				ctor: '_Tuple4',
				_0: x0,
				_1: x1,
				_2: x2,
				_3: 0 - A2(_Zinggi$elm_webgl_math$Vector3$dot, x, eye)
			},
			_1: {
				ctor: '_Tuple4',
				_0: y0,
				_1: y1,
				_2: y2,
				_3: 0 - A2(_Zinggi$elm_webgl_math$Vector3$dot, y, eye)
			},
			_2: {
				ctor: '_Tuple4',
				_0: z0,
				_1: z1,
				_2: z2,
				_3: 0 - A2(_Zinggi$elm_webgl_math$Vector3$dot, z, eye)
			},
			_3: {ctor: '_Tuple4', _0: 0, _1: 0, _2: 0, _3: 1}
		};
	});
var _Zinggi$elm_webgl_math$Matrix4$makeBasis = F3(
	function (_p74, _p73, _p72) {
		var _p75 = _p74;
		var _p76 = _p73;
		var _p77 = _p72;
		return {
			ctor: '_Tuple4',
			_0: {ctor: '_Tuple4', _0: _p75._0, _1: _p76._0, _2: _p77._0, _3: 0},
			_1: {ctor: '_Tuple4', _0: _p75._1, _1: _p76._1, _2: _p77._1, _3: 0},
			_2: {ctor: '_Tuple4', _0: _p75._2, _1: _p76._2, _2: _p77._2, _3: 0},
			_3: {ctor: '_Tuple4', _0: 0, _1: 0, _2: 0, _3: 1}
		};
	});
var _Zinggi$elm_webgl_math$Matrix4$translate = F2(
	function (_p79, _p78) {
		var _p80 = _p79;
		var _p93 = _p80._2;
		var _p92 = _p80._1;
		var _p91 = _p80._0;
		var _p81 = _p78;
		var _p90 = _p81._2._2;
		var _p89 = _p81._2._1;
		var _p88 = _p81._2._0;
		var _p87 = _p81._1._2;
		var _p86 = _p81._1._1;
		var _p85 = _p81._1._0;
		var _p84 = _p81._0._2;
		var _p83 = _p81._0._1;
		var _p82 = _p81._0._0;
		return {
			ctor: '_Tuple4',
			_0: {ctor: '_Tuple4', _0: _p82, _1: _p83, _2: _p84, _3: (((_p82 * _p91) + (_p83 * _p92)) + (_p84 * _p93)) + _p81._0._3},
			_1: {ctor: '_Tuple4', _0: _p85, _1: _p86, _2: _p87, _3: (((_p85 * _p91) + (_p86 * _p92)) + (_p87 * _p93)) + _p81._1._3},
			_2: {ctor: '_Tuple4', _0: _p88, _1: _p89, _2: _p90, _3: (((_p88 * _p91) + (_p89 * _p92)) + (_p90 * _p93)) + _p81._2._3},
			_3: _p81._3
		};
	});
var _Zinggi$elm_webgl_math$Matrix4$makeTranslate = function (_p94) {
	var _p95 = _p94;
	return {
		ctor: '_Tuple4',
		_0: {ctor: '_Tuple4', _0: 1, _1: 0, _2: 0, _3: _p95._0},
		_1: {ctor: '_Tuple4', _0: 0, _1: 1, _2: 0, _3: _p95._1},
		_2: {ctor: '_Tuple4', _0: 0, _1: 0, _2: 1, _3: _p95._2},
		_3: {ctor: '_Tuple4', _0: 0, _1: 0, _2: 0, _3: 1}
	};
};
var _Zinggi$elm_webgl_math$Matrix4$scale = F2(
	function (_p97, _p96) {
		var _p98 = _p97;
		var _p102 = _p98._2;
		var _p101 = _p98._1;
		var _p100 = _p98._0;
		var _p99 = _p96;
		return {
			ctor: '_Tuple4',
			_0: {ctor: '_Tuple4', _0: _p99._0._0 * _p100, _1: _p99._0._1 * _p101, _2: _p99._0._2 * _p102, _3: _p99._0._3},
			_1: {ctor: '_Tuple4', _0: _p99._1._0 * _p100, _1: _p99._1._1 * _p101, _2: _p99._1._2 * _p102, _3: _p99._1._3},
			_2: {ctor: '_Tuple4', _0: _p99._2._0 * _p100, _1: _p99._2._1 * _p101, _2: _p99._2._2 * _p102, _3: _p99._2._3},
			_3: _p99._3
		};
	});
var _Zinggi$elm_webgl_math$Matrix4$makeScale = function (_p103) {
	var _p104 = _p103;
	return {
		ctor: '_Tuple4',
		_0: {ctor: '_Tuple4', _0: _p104._0, _1: 0, _2: 0, _3: 0},
		_1: {ctor: '_Tuple4', _0: 0, _1: _p104._1, _2: 0, _3: 0},
		_2: {ctor: '_Tuple4', _0: 0, _1: 0, _2: _p104._2, _3: 0},
		_3: {ctor: '_Tuple4', _0: 0, _1: 0, _2: 0, _3: 1}
	};
};
var _Zinggi$elm_webgl_math$Matrix4$rotate = F3(
	function (angle, _p106, _p105) {
		var _p107 = _p106;
		var _p125 = _p107._2;
		var _p124 = _p107._1;
		var _p123 = _p107._0;
		var _p108 = _p105;
		var _p122 = _p108._2._2;
		var _p121 = _p108._2._1;
		var _p120 = _p108._2._0;
		var _p119 = _p108._1._2;
		var _p118 = _p108._1._1;
		var _p117 = _p108._1._0;
		var _p116 = _p108._0._2;
		var _p115 = _p108._0._1;
		var _p114 = _p108._0._0;
		var _p109 = {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Basics$cos(angle),
			_1: _elm_lang$core$Basics$sin(angle)
		};
		var c = _p109._0;
		var s = _p109._1;
		var c1 = 1 - c;
		var l_2 = ((_p123 * _p123) + (_p124 * _p124)) + (_p125 * _p125);
		var _p110 = function () {
			if (!_elm_lang$core$Native_Utils.eq(l_2, 1.0)) {
				var l_1 = 1 / _elm_lang$core$Basics$sqrt(l_2);
				return {ctor: '_Tuple3', _0: _p123 * l_1, _1: _p124 * l_1, _2: _p125 * l_1};
			} else {
				return {ctor: '_Tuple3', _0: _p123, _1: _p124, _2: _p125};
			}
		}();
		var x = _p110._0;
		var y = _p110._1;
		var z = _p110._2;
		var _p111 = {ctor: '_Tuple5', _0: z * s, _1: y * s, _2: x * s, _3: x * c1, _4: y * c1};
		var zs = _p111._0;
		var ys = _p111._1;
		var xs = _p111._2;
		var xc1 = _p111._3;
		var yc1 = _p111._4;
		var _p112 = {ctor: '_Tuple3', _0: y * xc1, _1: z * xc1, _2: z * yc1};
		var xyc1 = _p112._0;
		var xzc1 = _p112._1;
		var yzc1 = _p112._2;
		var _p113 = {
			ctor: '_Tuple3',
			_0: {ctor: '_Tuple3', _0: (x * xc1) + c, _1: xyc1 - zs, _2: xzc1 + ys},
			_1: {ctor: '_Tuple3', _0: xyc1 + zs, _1: (y * yc1) + c, _2: yzc1 - xs},
			_2: {ctor: '_Tuple3', _0: xzc1 - ys, _1: yzc1 + xs, _2: ((z * z) * c1) + c}
		};
		var t11 = _p113._0._0;
		var t12 = _p113._0._1;
		var t13 = _p113._0._2;
		var t21 = _p113._1._0;
		var t22 = _p113._1._1;
		var t23 = _p113._1._2;
		var t31 = _p113._2._0;
		var t32 = _p113._2._1;
		var t33 = _p113._2._2;
		return {
			ctor: '_Tuple4',
			_0: {ctor: '_Tuple4', _0: ((t11 * _p114) + (t21 * _p115)) + (t31 * _p116), _1: ((t12 * _p114) + (t22 * _p115)) + (t32 * _p116), _2: ((t13 * _p114) + (t23 * _p115)) + (t33 * _p116), _3: _p108._0._3},
			_1: {ctor: '_Tuple4', _0: ((t11 * _p117) + (t21 * _p118)) + (t31 * _p119), _1: ((t12 * _p117) + (t22 * _p118)) + (t32 * _p119), _2: ((t13 * _p117) + (t23 * _p118)) + (t33 * _p119), _3: _p108._1._3},
			_2: {ctor: '_Tuple4', _0: ((t11 * _p120) + (t21 * _p121)) + (t31 * _p122), _1: ((t12 * _p120) + (t22 * _p121)) + (t32 * _p122), _2: ((t13 * _p120) + (t23 * _p121)) + (t33 * _p122), _3: _p108._2._3},
			_3: _p108._3
		};
	});
var _Zinggi$elm_webgl_math$Matrix4$makeRotate = F2(
	function (angle, axis) {
		var _p126 = {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Basics$cos(angle),
			_1: _elm_lang$core$Basics$sin(angle)
		};
		var c = _p126._0;
		var s = _p126._1;
		var c1 = 1 - c;
		var _p127 = _Zinggi$elm_webgl_math$Vector3$normalize(axis);
		var x = _p127._0;
		var y = _p127._1;
		var z = _p127._2;
		var _p128 = {ctor: '_Tuple5', _0: z * s, _1: y * s, _2: x * s, _3: x * c1, _4: y * c1};
		var zs = _p128._0;
		var ys = _p128._1;
		var xs = _p128._2;
		var xc1 = _p128._3;
		var yc1 = _p128._4;
		var _p129 = {ctor: '_Tuple3', _0: y * xc1, _1: z * xc1, _2: z * yc1};
		var xyc1 = _p129._0;
		var xzc1 = _p129._1;
		var yzc1 = _p129._2;
		return {
			ctor: '_Tuple4',
			_0: {ctor: '_Tuple4', _0: (x * xc1) + c, _1: xyc1 - zs, _2: xzc1 + ys, _3: 0},
			_1: {ctor: '_Tuple4', _0: xyc1 + zs, _1: (y * yc1) + c, _2: yzc1 - xs, _3: 0},
			_2: {ctor: '_Tuple4', _0: xzc1 - ys, _1: yzc1 + xs, _2: ((z * z) * c1) + c, _3: 0},
			_3: {ctor: '_Tuple4', _0: 0, _1: 0, _2: 0, _3: 1}
		};
	});
var _Zinggi$elm_webgl_math$Matrix4$transform = F2(
	function (_p131, _p130) {
		var _p132 = _p131;
		var _p133 = _p130;
		var _p137 = _p133._2;
		var _p136 = _p133._1;
		var _p135 = _p133._0;
		var _p134 = {ctor: '_Tuple4', _0: (((_p132._0._0 * _p135) + (_p132._0._1 * _p136)) + (_p132._0._2 * _p137)) + _p132._0._3, _1: (((_p132._1._0 * _p135) + (_p132._1._1 * _p136)) + (_p132._1._2 * _p137)) + _p132._1._3, _2: (((_p132._2._0 * _p135) + (_p132._2._1 * _p136)) + (_p132._2._2 * _p137)) + _p132._2._3, _3: (((_p132._3._0 * _p135) + (_p132._3._1 * _p136)) + (_p132._3._2 * _p137)) + _p132._3._3};
		var r0 = _p134._0;
		var r1 = _p134._1;
		var r2 = _p134._2;
		var w = _p134._3;
		return (!_elm_lang$core$Native_Utils.eq(w, 1.0)) ? {ctor: '_Tuple3', _0: r0 / w, _1: r1 / w, _2: r2 / w} : {ctor: '_Tuple3', _0: r0, _1: r1, _2: r2};
	});
var _Zinggi$elm_webgl_math$Matrix4$mulVector = F2(
	function (_p138, v) {
		var _p139 = _p138;
		return {
			ctor: '_Tuple4',
			_0: A2(_Zinggi$elm_webgl_math$Vector4$dot, _p139._0, v),
			_1: A2(_Zinggi$elm_webgl_math$Vector4$dot, _p139._1, v),
			_2: A2(_Zinggi$elm_webgl_math$Vector4$dot, _p139._2, v),
			_3: A2(_Zinggi$elm_webgl_math$Vector4$dot, _p139._3, v)
		};
	});
var _Zinggi$elm_webgl_math$Matrix4$transpose = function (_p140) {
	var _p141 = _p140;
	return {
		ctor: '_Tuple4',
		_0: {ctor: '_Tuple4', _0: _p141._0._0, _1: _p141._1._0, _2: _p141._2._0, _3: _p141._3._0},
		_1: {ctor: '_Tuple4', _0: _p141._0._1, _1: _p141._1._1, _2: _p141._2._1, _3: _p141._3._1},
		_2: {ctor: '_Tuple4', _0: _p141._0._2, _1: _p141._1._2, _2: _p141._2._2, _3: _p141._3._2},
		_3: {ctor: '_Tuple4', _0: _p141._0._3, _1: _p141._1._3, _2: _p141._2._3, _3: _p141._3._3}
	};
};
var _Zinggi$elm_webgl_math$Matrix4$mul = F2(
	function (_p143, _p142) {
		var _p144 = _p143;
		var _p177 = _p144._3._3;
		var _p176 = _p144._3._2;
		var _p175 = _p144._3._1;
		var _p174 = _p144._3._0;
		var _p173 = _p144._2._3;
		var _p172 = _p144._2._2;
		var _p171 = _p144._2._1;
		var _p170 = _p144._2._0;
		var _p169 = _p144._1._3;
		var _p168 = _p144._1._2;
		var _p167 = _p144._1._1;
		var _p166 = _p144._1._0;
		var _p165 = _p144._0._3;
		var _p164 = _p144._0._2;
		var _p163 = _p144._0._1;
		var _p162 = _p144._0._0;
		var _p145 = _p142;
		var _p161 = _p145._3._3;
		var _p160 = _p145._3._2;
		var _p159 = _p145._3._1;
		var _p158 = _p145._3._0;
		var _p157 = _p145._2._3;
		var _p156 = _p145._2._2;
		var _p155 = _p145._2._1;
		var _p154 = _p145._2._0;
		var _p153 = _p145._1._3;
		var _p152 = _p145._1._2;
		var _p151 = _p145._1._1;
		var _p150 = _p145._1._0;
		var _p149 = _p145._0._3;
		var _p148 = _p145._0._2;
		var _p147 = _p145._0._1;
		var _p146 = _p145._0._0;
		return {
			ctor: '_Tuple4',
			_0: {ctor: '_Tuple4', _0: (((_p162 * _p146) + (_p163 * _p150)) + (_p164 * _p154)) + (_p165 * _p158), _1: (((_p162 * _p147) + (_p163 * _p151)) + (_p164 * _p155)) + (_p165 * _p159), _2: (((_p162 * _p148) + (_p163 * _p152)) + (_p164 * _p156)) + (_p165 * _p160), _3: (((_p162 * _p149) + (_p163 * _p153)) + (_p164 * _p157)) + (_p165 * _p161)},
			_1: {ctor: '_Tuple4', _0: (((_p166 * _p146) + (_p167 * _p150)) + (_p168 * _p154)) + (_p169 * _p158), _1: (((_p166 * _p147) + (_p167 * _p151)) + (_p168 * _p155)) + (_p169 * _p159), _2: (((_p166 * _p148) + (_p167 * _p152)) + (_p168 * _p156)) + (_p169 * _p160), _3: (((_p166 * _p149) + (_p167 * _p153)) + (_p168 * _p157)) + (_p169 * _p161)},
			_2: {ctor: '_Tuple4', _0: (((_p170 * _p146) + (_p171 * _p150)) + (_p172 * _p154)) + (_p173 * _p158), _1: (((_p170 * _p147) + (_p171 * _p151)) + (_p172 * _p155)) + (_p173 * _p159), _2: (((_p170 * _p148) + (_p171 * _p152)) + (_p172 * _p156)) + (_p173 * _p160), _3: (((_p170 * _p149) + (_p171 * _p153)) + (_p172 * _p157)) + (_p173 * _p161)},
			_3: {ctor: '_Tuple4', _0: (((_p174 * _p146) + (_p175 * _p150)) + (_p176 * _p154)) + (_p177 * _p158), _1: (((_p174 * _p147) + (_p175 * _p151)) + (_p176 * _p155)) + (_p177 * _p159), _2: (((_p174 * _p148) + (_p175 * _p152)) + (_p176 * _p156)) + (_p177 * _p160), _3: (((_p174 * _p149) + (_p175 * _p153)) + (_p176 * _p157)) + (_p177 * _p161)}
		};
	});
var _Zinggi$elm_webgl_math$Matrix4$mulByConst = F2(
	function (a, _p178) {
		var _p179 = _p178;
		return {
			ctor: '_Tuple4',
			_0: A2(_Zinggi$elm_webgl_math$Vector4$scale, a, _p179._0),
			_1: A2(_Zinggi$elm_webgl_math$Vector4$scale, a, _p179._1),
			_2: A2(_Zinggi$elm_webgl_math$Vector4$scale, a, _p179._2),
			_3: A2(_Zinggi$elm_webgl_math$Vector4$scale, a, _p179._3)
		};
	});
var _Zinggi$elm_webgl_math$Matrix4$fromColumns = F4(
	function (a, b, c, d) {
		return _Zinggi$elm_webgl_math$Matrix4$transpose(
			{ctor: '_Tuple4', _0: a, _1: b, _2: c, _3: d});
	});
var _Zinggi$elm_webgl_math$Matrix4$fromRows = F4(
	function (a, b, c, d) {
		return {ctor: '_Tuple4', _0: a, _1: b, _2: c, _3: d};
	});
var _Zinggi$elm_webgl_math$Matrix4$identity = {
	ctor: '_Tuple4',
	_0: {ctor: '_Tuple4', _0: 1, _1: 0, _2: 0, _3: 0},
	_1: {ctor: '_Tuple4', _0: 0, _1: 1, _2: 0, _3: 0},
	_2: {ctor: '_Tuple4', _0: 0, _1: 0, _2: 1, _3: 0},
	_3: {ctor: '_Tuple4', _0: 0, _1: 0, _2: 0, _3: 1}
};
var _Zinggi$elm_webgl_math$Matrix4$foldr = F3(
	function (f, init, _p180) {
		var _p181 = _p180;
		return A3(
			_Zinggi$elm_webgl_math$Vector4$foldr,
			f,
			A3(
				_Zinggi$elm_webgl_math$Vector4$foldr,
				f,
				A3(
					_Zinggi$elm_webgl_math$Vector4$foldr,
					f,
					A3(_Zinggi$elm_webgl_math$Vector4$foldr, f, init, _p181._3),
					_p181._2),
				_p181._1),
			_p181._0);
	});
var _Zinggi$elm_webgl_math$Matrix4$foldl = F3(
	function (f, init, _p182) {
		var _p183 = _p182;
		return A3(
			_Zinggi$elm_webgl_math$Vector4$foldl,
			f,
			A3(
				_Zinggi$elm_webgl_math$Vector4$foldl,
				f,
				A3(
					_Zinggi$elm_webgl_math$Vector4$foldl,
					f,
					A3(_Zinggi$elm_webgl_math$Vector4$foldl, f, init, _p183._0),
					_p183._1),
				_p183._2),
			_p183._3);
	});
var _Zinggi$elm_webgl_math$Matrix4$maxNorm = A2(
	_Zinggi$elm_webgl_math$Matrix4$foldl,
	F2(
		function (elem, acc) {
			return A2(
				_elm_lang$core$Basics$max,
				_elm_lang$core$Basics$abs(elem),
				acc);
		}),
	0);
var _Zinggi$elm_webgl_math$Matrix4$map2 = function (f) {
	return _Zinggi$elm_webgl_math$Vector4$map2(
		_Zinggi$elm_webgl_math$Vector4$map2(f));
};
var _Zinggi$elm_webgl_math$Matrix4$add = _Zinggi$elm_webgl_math$Matrix4$map2(
	F2(
		function (x, y) {
			return x + y;
		}));
var _Zinggi$elm_webgl_math$Matrix4$sub = _Zinggi$elm_webgl_math$Matrix4$map2(
	F2(
		function (x, y) {
			return x - y;
		}));
var _Zinggi$elm_webgl_math$Matrix4$almostEqual = F3(
	function (eps, a, b) {
		return _elm_lang$core$Native_Utils.cmp(
			_Zinggi$elm_webgl_math$Matrix4$maxNorm(
				A2(_Zinggi$elm_webgl_math$Matrix4$sub, a, b)),
			eps) < 1;
	});
var _Zinggi$elm_webgl_math$Matrix4$elementWiseMul = _Zinggi$elm_webgl_math$Matrix4$map2(
	F2(
		function (x, y) {
			return x * y;
		}));
var _Zinggi$elm_webgl_math$Matrix4$map = function (f) {
	return _Zinggi$elm_webgl_math$Vector4$map(
		_Zinggi$elm_webgl_math$Vector4$map(f));
};

var _elm_lang$core$Set$foldr = F3(
	function (f, b, _p0) {
		var _p1 = _p0;
		return A3(
			_elm_lang$core$Dict$foldr,
			F3(
				function (k, _p2, b) {
					return A2(f, k, b);
				}),
			b,
			_p1._0);
	});
var _elm_lang$core$Set$foldl = F3(
	function (f, b, _p3) {
		var _p4 = _p3;
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, _p5, b) {
					return A2(f, k, b);
				}),
			b,
			_p4._0);
	});
var _elm_lang$core$Set$toList = function (_p6) {
	var _p7 = _p6;
	return _elm_lang$core$Dict$keys(_p7._0);
};
var _elm_lang$core$Set$size = function (_p8) {
	var _p9 = _p8;
	return _elm_lang$core$Dict$size(_p9._0);
};
var _elm_lang$core$Set$member = F2(
	function (k, _p10) {
		var _p11 = _p10;
		return A2(_elm_lang$core$Dict$member, k, _p11._0);
	});
var _elm_lang$core$Set$isEmpty = function (_p12) {
	var _p13 = _p12;
	return _elm_lang$core$Dict$isEmpty(_p13._0);
};
var _elm_lang$core$Set$Set_elm_builtin = function (a) {
	return {ctor: 'Set_elm_builtin', _0: a};
};
var _elm_lang$core$Set$empty = _elm_lang$core$Set$Set_elm_builtin(_elm_lang$core$Dict$empty);
var _elm_lang$core$Set$singleton = function (k) {
	return _elm_lang$core$Set$Set_elm_builtin(
		A2(
			_elm_lang$core$Dict$singleton,
			k,
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Set$insert = F2(
	function (k, _p14) {
		var _p15 = _p14;
		return _elm_lang$core$Set$Set_elm_builtin(
			A3(
				_elm_lang$core$Dict$insert,
				k,
				{ctor: '_Tuple0'},
				_p15._0));
	});
var _elm_lang$core$Set$fromList = function (xs) {
	return A3(_elm_lang$core$List$foldl, _elm_lang$core$Set$insert, _elm_lang$core$Set$empty, xs);
};
var _elm_lang$core$Set$map = F2(
	function (f, s) {
		return _elm_lang$core$Set$fromList(
			A2(
				_elm_lang$core$List$map,
				f,
				_elm_lang$core$Set$toList(s)));
	});
var _elm_lang$core$Set$remove = F2(
	function (k, _p16) {
		var _p17 = _p16;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$remove, k, _p17._0));
	});
var _elm_lang$core$Set$union = F2(
	function (_p19, _p18) {
		var _p20 = _p19;
		var _p21 = _p18;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$union, _p20._0, _p21._0));
	});
var _elm_lang$core$Set$intersect = F2(
	function (_p23, _p22) {
		var _p24 = _p23;
		var _p25 = _p22;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$intersect, _p24._0, _p25._0));
	});
var _elm_lang$core$Set$diff = F2(
	function (_p27, _p26) {
		var _p28 = _p27;
		var _p29 = _p26;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$diff, _p28._0, _p29._0));
	});
var _elm_lang$core$Set$filter = F2(
	function (p, _p30) {
		var _p31 = _p30;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(
				_elm_lang$core$Dict$filter,
				F2(
					function (k, _p32) {
						return p(k);
					}),
				_p31._0));
	});
var _elm_lang$core$Set$partition = F2(
	function (p, _p33) {
		var _p34 = _p33;
		var _p35 = A2(
			_elm_lang$core$Dict$partition,
			F2(
				function (k, _p36) {
					return p(k);
				}),
			_p34._0);
		var p1 = _p35._0;
		var p2 = _p35._1;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Set$Set_elm_builtin(p1),
			_1: _elm_lang$core$Set$Set_elm_builtin(p2)
		};
	});

var _elm_community$list_extra$List_Extra$greedyGroupsOfWithStep = F3(
	function (size, step, xs) {
		var okayXs = _elm_lang$core$Native_Utils.cmp(
			_elm_lang$core$List$length(xs),
			0) > 0;
		var okayArgs = (_elm_lang$core$Native_Utils.cmp(size, 0) > 0) && (_elm_lang$core$Native_Utils.cmp(step, 0) > 0);
		var xs_ = A2(_elm_lang$core$List$drop, step, xs);
		var group = A2(_elm_lang$core$List$take, size, xs);
		return (okayArgs && okayXs) ? {
			ctor: '::',
			_0: group,
			_1: A3(_elm_community$list_extra$List_Extra$greedyGroupsOfWithStep, size, step, xs_)
		} : {ctor: '[]'};
	});
var _elm_community$list_extra$List_Extra$greedyGroupsOf = F2(
	function (size, xs) {
		return A3(_elm_community$list_extra$List_Extra$greedyGroupsOfWithStep, size, size, xs);
	});
var _elm_community$list_extra$List_Extra$groupsOfWithStep = F3(
	function (size, step, xs) {
		var okayArgs = (_elm_lang$core$Native_Utils.cmp(size, 0) > 0) && (_elm_lang$core$Native_Utils.cmp(step, 0) > 0);
		var xs_ = A2(_elm_lang$core$List$drop, step, xs);
		var group = A2(_elm_lang$core$List$take, size, xs);
		var okayLength = _elm_lang$core$Native_Utils.eq(
			size,
			_elm_lang$core$List$length(group));
		return (okayArgs && okayLength) ? {
			ctor: '::',
			_0: group,
			_1: A3(_elm_community$list_extra$List_Extra$groupsOfWithStep, size, step, xs_)
		} : {ctor: '[]'};
	});
var _elm_community$list_extra$List_Extra$groupsOf = F2(
	function (size, xs) {
		return A3(_elm_community$list_extra$List_Extra$groupsOfWithStep, size, size, xs);
	});
var _elm_community$list_extra$List_Extra$zip5 = _elm_lang$core$List$map5(
	F5(
		function (v0, v1, v2, v3, v4) {
			return {ctor: '_Tuple5', _0: v0, _1: v1, _2: v2, _3: v3, _4: v4};
		}));
var _elm_community$list_extra$List_Extra$zip4 = _elm_lang$core$List$map4(
	F4(
		function (v0, v1, v2, v3) {
			return {ctor: '_Tuple4', _0: v0, _1: v1, _2: v2, _3: v3};
		}));
var _elm_community$list_extra$List_Extra$zip3 = _elm_lang$core$List$map3(
	F3(
		function (v0, v1, v2) {
			return {ctor: '_Tuple3', _0: v0, _1: v1, _2: v2};
		}));
var _elm_community$list_extra$List_Extra$zip = _elm_lang$core$List$map2(
	F2(
		function (v0, v1) {
			return {ctor: '_Tuple2', _0: v0, _1: v1};
		}));
var _elm_community$list_extra$List_Extra$isPrefixOf = F2(
	function (prefix, xs) {
		var _p0 = {ctor: '_Tuple2', _0: prefix, _1: xs};
		if (_p0._0.ctor === '[]') {
			return true;
		} else {
			if (_p0._1.ctor === '[]') {
				return false;
			} else {
				return _elm_lang$core$Native_Utils.eq(_p0._0._0, _p0._1._0) && A2(_elm_community$list_extra$List_Extra$isPrefixOf, _p0._0._1, _p0._1._1);
			}
		}
	});
var _elm_community$list_extra$List_Extra$isSuffixOf = F2(
	function (suffix, xs) {
		return A2(
			_elm_community$list_extra$List_Extra$isPrefixOf,
			_elm_lang$core$List$reverse(suffix),
			_elm_lang$core$List$reverse(xs));
	});
var _elm_community$list_extra$List_Extra$selectSplit = function (xs) {
	var _p1 = xs;
	if (_p1.ctor === '[]') {
		return {ctor: '[]'};
	} else {
		var _p5 = _p1._1;
		var _p4 = _p1._0;
		return {
			ctor: '::',
			_0: {
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _p4,
				_2: _p5
			},
			_1: A2(
				_elm_lang$core$List$map,
				function (_p2) {
					var _p3 = _p2;
					return {
						ctor: '_Tuple3',
						_0: {ctor: '::', _0: _p4, _1: _p3._0},
						_1: _p3._1,
						_2: _p3._2
					};
				},
				_elm_community$list_extra$List_Extra$selectSplit(_p5))
		};
	}
};
var _elm_community$list_extra$List_Extra$select = function (xs) {
	var _p6 = xs;
	if (_p6.ctor === '[]') {
		return {ctor: '[]'};
	} else {
		var _p10 = _p6._1;
		var _p9 = _p6._0;
		return {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: _p9, _1: _p10},
			_1: A2(
				_elm_lang$core$List$map,
				function (_p7) {
					var _p8 = _p7;
					return {
						ctor: '_Tuple2',
						_0: _p8._0,
						_1: {ctor: '::', _0: _p9, _1: _p8._1}
					};
				},
				_elm_community$list_extra$List_Extra$select(_p10))
		};
	}
};
var _elm_community$list_extra$List_Extra$tailsHelp = F2(
	function (e, list) {
		var _p11 = list;
		if (_p11.ctor === '::') {
			var _p12 = _p11._0;
			return {
				ctor: '::',
				_0: {ctor: '::', _0: e, _1: _p12},
				_1: {ctor: '::', _0: _p12, _1: _p11._1}
			};
		} else {
			return {ctor: '[]'};
		}
	});
var _elm_community$list_extra$List_Extra$tails = A2(
	_elm_lang$core$List$foldr,
	_elm_community$list_extra$List_Extra$tailsHelp,
	{
		ctor: '::',
		_0: {ctor: '[]'},
		_1: {ctor: '[]'}
	});
var _elm_community$list_extra$List_Extra$isInfixOf = F2(
	function (infix, xs) {
		return A2(
			_elm_lang$core$List$any,
			_elm_community$list_extra$List_Extra$isPrefixOf(infix),
			_elm_community$list_extra$List_Extra$tails(xs));
	});
var _elm_community$list_extra$List_Extra$inits = A2(
	_elm_lang$core$List$foldr,
	F2(
		function (e, acc) {
			return {
				ctor: '::',
				_0: {ctor: '[]'},
				_1: A2(
					_elm_lang$core$List$map,
					F2(
						function (x, y) {
							return {ctor: '::', _0: x, _1: y};
						})(e),
					acc)
			};
		}),
	{
		ctor: '::',
		_0: {ctor: '[]'},
		_1: {ctor: '[]'}
	});
var _elm_community$list_extra$List_Extra$groupWhileTransitively = F2(
	function (cmp, xs_) {
		var _p13 = xs_;
		if (_p13.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			if (_p13._1.ctor === '[]') {
				return {
					ctor: '::',
					_0: {
						ctor: '::',
						_0: _p13._0,
						_1: {ctor: '[]'}
					},
					_1: {ctor: '[]'}
				};
			} else {
				var _p15 = _p13._0;
				var _p14 = A2(_elm_community$list_extra$List_Extra$groupWhileTransitively, cmp, _p13._1);
				if (_p14.ctor === '::') {
					return A2(cmp, _p15, _p13._1._0) ? {
						ctor: '::',
						_0: {ctor: '::', _0: _p15, _1: _p14._0},
						_1: _p14._1
					} : {
						ctor: '::',
						_0: {
							ctor: '::',
							_0: _p15,
							_1: {ctor: '[]'}
						},
						_1: _p14
					};
				} else {
					return {ctor: '[]'};
				}
			}
		}
	});
var _elm_community$list_extra$List_Extra$stripPrefix = F2(
	function (prefix, xs) {
		var step = F2(
			function (e, m) {
				var _p16 = m;
				if (_p16.ctor === 'Nothing') {
					return _elm_lang$core$Maybe$Nothing;
				} else {
					if (_p16._0.ctor === '[]') {
						return _elm_lang$core$Maybe$Nothing;
					} else {
						return _elm_lang$core$Native_Utils.eq(e, _p16._0._0) ? _elm_lang$core$Maybe$Just(_p16._0._1) : _elm_lang$core$Maybe$Nothing;
					}
				}
			});
		return A3(
			_elm_lang$core$List$foldl,
			step,
			_elm_lang$core$Maybe$Just(xs),
			prefix);
	});
var _elm_community$list_extra$List_Extra$dropWhileRight = function (p) {
	return A2(
		_elm_lang$core$List$foldr,
		F2(
			function (x, xs) {
				return (p(x) && _elm_lang$core$List$isEmpty(xs)) ? {ctor: '[]'} : {ctor: '::', _0: x, _1: xs};
			}),
		{ctor: '[]'});
};
var _elm_community$list_extra$List_Extra$takeWhileRight = function (p) {
	var step = F2(
		function (x, _p17) {
			var _p18 = _p17;
			var _p19 = _p18._0;
			return (p(x) && _p18._1) ? {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: x, _1: _p19},
				_1: true
			} : {ctor: '_Tuple2', _0: _p19, _1: false};
		});
	return function (_p20) {
		return _elm_lang$core$Tuple$first(
			A3(
				_elm_lang$core$List$foldr,
				step,
				{
					ctor: '_Tuple2',
					_0: {ctor: '[]'},
					_1: true
				},
				_p20));
	};
};
var _elm_community$list_extra$List_Extra$splitAt = F2(
	function (n, xs) {
		return {
			ctor: '_Tuple2',
			_0: A2(_elm_lang$core$List$take, n, xs),
			_1: A2(_elm_lang$core$List$drop, n, xs)
		};
	});
var _elm_community$list_extra$List_Extra$groupsOfVarying_ = F3(
	function (listOflengths, list, accu) {
		groupsOfVarying_:
		while (true) {
			var _p21 = {ctor: '_Tuple2', _0: listOflengths, _1: list};
			if (((_p21.ctor === '_Tuple2') && (_p21._0.ctor === '::')) && (_p21._1.ctor === '::')) {
				var _p22 = A2(_elm_community$list_extra$List_Extra$splitAt, _p21._0._0, list);
				var head = _p22._0;
				var tail = _p22._1;
				var _v11 = _p21._0._1,
					_v12 = tail,
					_v13 = {ctor: '::', _0: head, _1: accu};
				listOflengths = _v11;
				list = _v12;
				accu = _v13;
				continue groupsOfVarying_;
			} else {
				return _elm_lang$core$List$reverse(accu);
			}
		}
	});
var _elm_community$list_extra$List_Extra$groupsOfVarying = F2(
	function (listOflengths, list) {
		return A3(
			_elm_community$list_extra$List_Extra$groupsOfVarying_,
			listOflengths,
			list,
			{ctor: '[]'});
	});
var _elm_community$list_extra$List_Extra$unfoldr = F2(
	function (f, seed) {
		var _p23 = f(seed);
		if (_p23.ctor === 'Nothing') {
			return {ctor: '[]'};
		} else {
			return {
				ctor: '::',
				_0: _p23._0._0,
				_1: A2(_elm_community$list_extra$List_Extra$unfoldr, f, _p23._0._1)
			};
		}
	});
var _elm_community$list_extra$List_Extra$scanr1 = F2(
	function (f, xs_) {
		var _p24 = xs_;
		if (_p24.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			if (_p24._1.ctor === '[]') {
				return {
					ctor: '::',
					_0: _p24._0,
					_1: {ctor: '[]'}
				};
			} else {
				var _p25 = A2(_elm_community$list_extra$List_Extra$scanr1, f, _p24._1);
				if (_p25.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, _p24._0, _p25._0),
						_1: _p25
					};
				} else {
					return {ctor: '[]'};
				}
			}
		}
	});
var _elm_community$list_extra$List_Extra$scanr = F3(
	function (f, acc, xs_) {
		var _p26 = xs_;
		if (_p26.ctor === '[]') {
			return {
				ctor: '::',
				_0: acc,
				_1: {ctor: '[]'}
			};
		} else {
			var _p27 = A3(_elm_community$list_extra$List_Extra$scanr, f, acc, _p26._1);
			if (_p27.ctor === '::') {
				return {
					ctor: '::',
					_0: A2(f, _p26._0, _p27._0),
					_1: _p27
				};
			} else {
				return {ctor: '[]'};
			}
		}
	});
var _elm_community$list_extra$List_Extra$scanl1 = F2(
	function (f, xs_) {
		var _p28 = xs_;
		if (_p28.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			return A3(_elm_lang$core$List$scanl, f, _p28._0, _p28._1);
		}
	});
var _elm_community$list_extra$List_Extra$indexedFoldr = F3(
	function (func, acc, list) {
		var step = F2(
			function (x, _p29) {
				var _p30 = _p29;
				var _p31 = _p30._0;
				return {
					ctor: '_Tuple2',
					_0: _p31 - 1,
					_1: A3(func, _p31, x, _p30._1)
				};
			});
		return _elm_lang$core$Tuple$second(
			A3(
				_elm_lang$core$List$foldr,
				step,
				{
					ctor: '_Tuple2',
					_0: _elm_lang$core$List$length(list) - 1,
					_1: acc
				},
				list));
	});
var _elm_community$list_extra$List_Extra$indexedFoldl = F3(
	function (func, acc, list) {
		var step = F2(
			function (x, _p32) {
				var _p33 = _p32;
				var _p34 = _p33._0;
				return {
					ctor: '_Tuple2',
					_0: _p34 + 1,
					_1: A3(func, _p34, x, _p33._1)
				};
			});
		return _elm_lang$core$Tuple$second(
			A3(
				_elm_lang$core$List$foldl,
				step,
				{ctor: '_Tuple2', _0: 0, _1: acc},
				list));
	});
var _elm_community$list_extra$List_Extra$foldr1 = F2(
	function (f, xs) {
		var mf = F2(
			function (x, m) {
				return _elm_lang$core$Maybe$Just(
					function () {
						var _p35 = m;
						if (_p35.ctor === 'Nothing') {
							return x;
						} else {
							return A2(f, x, _p35._0);
						}
					}());
			});
		return A3(_elm_lang$core$List$foldr, mf, _elm_lang$core$Maybe$Nothing, xs);
	});
var _elm_community$list_extra$List_Extra$foldl1 = F2(
	function (f, xs) {
		var mf = F2(
			function (x, m) {
				return _elm_lang$core$Maybe$Just(
					function () {
						var _p36 = m;
						if (_p36.ctor === 'Nothing') {
							return x;
						} else {
							return A2(f, _p36._0, x);
						}
					}());
			});
		return A3(_elm_lang$core$List$foldl, mf, _elm_lang$core$Maybe$Nothing, xs);
	});
var _elm_community$list_extra$List_Extra$interweaveHelp = F3(
	function (l1, l2, acc) {
		interweaveHelp:
		while (true) {
			var _p37 = {ctor: '_Tuple2', _0: l1, _1: l2};
			_v24_1:
			do {
				if (_p37._0.ctor === '::') {
					if (_p37._1.ctor === '::') {
						var _v25 = _p37._0._1,
							_v26 = _p37._1._1,
							_v27 = A2(
							_elm_lang$core$Basics_ops['++'],
							acc,
							{
								ctor: '::',
								_0: _p37._0._0,
								_1: {
									ctor: '::',
									_0: _p37._1._0,
									_1: {ctor: '[]'}
								}
							});
						l1 = _v25;
						l2 = _v26;
						acc = _v27;
						continue interweaveHelp;
					} else {
						break _v24_1;
					}
				} else {
					if (_p37._1.ctor === '[]') {
						break _v24_1;
					} else {
						return A2(_elm_lang$core$Basics_ops['++'], acc, _p37._1);
					}
				}
			} while(false);
			return A2(_elm_lang$core$Basics_ops['++'], acc, _p37._0);
		}
	});
var _elm_community$list_extra$List_Extra$interweave = F2(
	function (l1, l2) {
		return A3(
			_elm_community$list_extra$List_Extra$interweaveHelp,
			l1,
			l2,
			{ctor: '[]'});
	});
var _elm_community$list_extra$List_Extra$permutations = function (xs_) {
	var _p38 = xs_;
	if (_p38.ctor === '[]') {
		return {
			ctor: '::',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		};
	} else {
		var f = function (_p39) {
			var _p40 = _p39;
			return A2(
				_elm_lang$core$List$map,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					})(_p40._0),
				_elm_community$list_extra$List_Extra$permutations(_p40._1));
		};
		return A2(
			_elm_lang$core$List$concatMap,
			f,
			_elm_community$list_extra$List_Extra$select(_p38));
	}
};
var _elm_community$list_extra$List_Extra$isPermutationOf = F2(
	function (permut, xs) {
		return A2(
			_elm_lang$core$List$member,
			permut,
			_elm_community$list_extra$List_Extra$permutations(xs));
	});
var _elm_community$list_extra$List_Extra$subsequencesNonEmpty = function (xs) {
	var _p41 = xs;
	if (_p41.ctor === '[]') {
		return {ctor: '[]'};
	} else {
		var _p42 = _p41._0;
		var f = F2(
			function (ys, r) {
				return {
					ctor: '::',
					_0: ys,
					_1: {
						ctor: '::',
						_0: {ctor: '::', _0: _p42, _1: ys},
						_1: r
					}
				};
			});
		return {
			ctor: '::',
			_0: {
				ctor: '::',
				_0: _p42,
				_1: {ctor: '[]'}
			},
			_1: A3(
				_elm_lang$core$List$foldr,
				f,
				{ctor: '[]'},
				_elm_community$list_extra$List_Extra$subsequencesNonEmpty(_p41._1))
		};
	}
};
var _elm_community$list_extra$List_Extra$subsequences = function (xs) {
	return {
		ctor: '::',
		_0: {ctor: '[]'},
		_1: _elm_community$list_extra$List_Extra$subsequencesNonEmpty(xs)
	};
};
var _elm_community$list_extra$List_Extra$isSubsequenceOf = F2(
	function (subseq, xs) {
		return A2(
			_elm_lang$core$List$member,
			subseq,
			_elm_community$list_extra$List_Extra$subsequences(xs));
	});
var _elm_community$list_extra$List_Extra$transpose = function (ll) {
	transpose:
	while (true) {
		var _p43 = ll;
		if (_p43.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			if (_p43._0.ctor === '[]') {
				var _v32 = _p43._1;
				ll = _v32;
				continue transpose;
			} else {
				var _p44 = _p43._1;
				var tails = A2(_elm_lang$core$List$filterMap, _elm_lang$core$List$tail, _p44);
				var heads = A2(_elm_lang$core$List$filterMap, _elm_lang$core$List$head, _p44);
				return {
					ctor: '::',
					_0: {ctor: '::', _0: _p43._0._0, _1: heads},
					_1: _elm_community$list_extra$List_Extra$transpose(
						{ctor: '::', _0: _p43._0._1, _1: tails})
				};
			}
		}
	}
};
var _elm_community$list_extra$List_Extra$intercalate = function (xs) {
	return function (_p45) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$intersperse, xs, _p45));
	};
};
var _elm_community$list_extra$List_Extra$filterNot = F2(
	function (pred, list) {
		return A2(
			_elm_lang$core$List$filter,
			function (_p46) {
				return !pred(_p46);
			},
			list);
	});
var _elm_community$list_extra$List_Extra$removeAt = F2(
	function (index, l) {
		if (_elm_lang$core$Native_Utils.cmp(index, 0) < 0) {
			return l;
		} else {
			var tail = _elm_lang$core$List$tail(
				A2(_elm_lang$core$List$drop, index, l));
			var head = A2(_elm_lang$core$List$take, index, l);
			var _p47 = tail;
			if (_p47.ctor === 'Nothing') {
				return l;
			} else {
				return A2(_elm_lang$core$List$append, head, _p47._0);
			}
		}
	});
var _elm_community$list_extra$List_Extra$stableSortWith = F2(
	function (pred, list) {
		var predWithIndex = F2(
			function (_p49, _p48) {
				var _p50 = _p49;
				var _p51 = _p48;
				var result = A2(pred, _p50._0, _p51._0);
				var _p52 = result;
				if (_p52.ctor === 'EQ') {
					return A2(_elm_lang$core$Basics$compare, _p50._1, _p51._1);
				} else {
					return result;
				}
			});
		var listWithIndex = A2(
			_elm_lang$core$List$indexedMap,
			F2(
				function (i, a) {
					return {ctor: '_Tuple2', _0: a, _1: i};
				}),
			list);
		return A2(
			_elm_lang$core$List$map,
			_elm_lang$core$Tuple$first,
			A2(_elm_lang$core$List$sortWith, predWithIndex, listWithIndex));
	});
var _elm_community$list_extra$List_Extra$setAt = F3(
	function (index, value, l) {
		if (_elm_lang$core$Native_Utils.cmp(index, 0) < 0) {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			var tail = _elm_lang$core$List$tail(
				A2(_elm_lang$core$List$drop, index, l));
			var head = A2(_elm_lang$core$List$take, index, l);
			var _p53 = tail;
			if (_p53.ctor === 'Nothing') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				return _elm_lang$core$Maybe$Just(
					A2(
						_elm_lang$core$List$append,
						head,
						{ctor: '::', _0: value, _1: _p53._0}));
			}
		}
	});
var _elm_community$list_extra$List_Extra$remove = F2(
	function (x, xs) {
		var _p54 = xs;
		if (_p54.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var _p56 = _p54._1;
			var _p55 = _p54._0;
			return _elm_lang$core$Native_Utils.eq(x, _p55) ? _p56 : {
				ctor: '::',
				_0: _p55,
				_1: A2(_elm_community$list_extra$List_Extra$remove, x, _p56)
			};
		}
	});
var _elm_community$list_extra$List_Extra$updateIfIndex = F3(
	function (predicate, update, list) {
		return A2(
			_elm_lang$core$List$indexedMap,
			F2(
				function (i, x) {
					return predicate(i) ? update(x) : x;
				}),
			list);
	});
var _elm_community$list_extra$List_Extra$updateAt = F3(
	function (index, update, list) {
		return ((_elm_lang$core$Native_Utils.cmp(index, 0) < 0) || (_elm_lang$core$Native_Utils.cmp(
			index,
			_elm_lang$core$List$length(list)) > -1)) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
			A3(
				_elm_community$list_extra$List_Extra$updateIfIndex,
				F2(
					function (x, y) {
						return _elm_lang$core$Native_Utils.eq(x, y);
					})(index),
				update,
				list));
	});
var _elm_community$list_extra$List_Extra$updateIf = F3(
	function (predicate, update, list) {
		return A2(
			_elm_lang$core$List$map,
			function (item) {
				return predicate(item) ? update(item) : item;
			},
			list);
	});
var _elm_community$list_extra$List_Extra$replaceIf = F3(
	function (predicate, replacement, list) {
		return A3(
			_elm_community$list_extra$List_Extra$updateIf,
			predicate,
			_elm_lang$core$Basics$always(replacement),
			list);
	});
var _elm_community$list_extra$List_Extra$findIndices = function (p) {
	return function (_p57) {
		return A2(
			_elm_lang$core$List$map,
			_elm_lang$core$Tuple$first,
			A2(
				_elm_lang$core$List$filter,
				function (_p58) {
					var _p59 = _p58;
					return p(_p59._1);
				},
				A2(
					_elm_lang$core$List$indexedMap,
					F2(
						function (v0, v1) {
							return {ctor: '_Tuple2', _0: v0, _1: v1};
						}),
					_p57)));
	};
};
var _elm_community$list_extra$List_Extra$findIndex = function (p) {
	return function (_p60) {
		return _elm_lang$core$List$head(
			A2(_elm_community$list_extra$List_Extra$findIndices, p, _p60));
	};
};
var _elm_community$list_extra$List_Extra$splitWhen = F2(
	function (predicate, list) {
		return A2(
			_elm_lang$core$Maybe$map,
			function (i) {
				return A2(_elm_community$list_extra$List_Extra$splitAt, i, list);
			},
			A2(_elm_community$list_extra$List_Extra$findIndex, predicate, list));
	});
var _elm_community$list_extra$List_Extra$elemIndices = function (x) {
	return _elm_community$list_extra$List_Extra$findIndices(
		F2(
			function (x, y) {
				return _elm_lang$core$Native_Utils.eq(x, y);
			})(x));
};
var _elm_community$list_extra$List_Extra$elemIndex = function (x) {
	return _elm_community$list_extra$List_Extra$findIndex(
		F2(
			function (x, y) {
				return _elm_lang$core$Native_Utils.eq(x, y);
			})(x));
};
var _elm_community$list_extra$List_Extra$find = F2(
	function (predicate, list) {
		find:
		while (true) {
			var _p61 = list;
			if (_p61.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p62 = _p61._0;
				if (predicate(_p62)) {
					return _elm_lang$core$Maybe$Just(_p62);
				} else {
					var _v41 = predicate,
						_v42 = _p61._1;
					predicate = _v41;
					list = _v42;
					continue find;
				}
			}
		}
	});
var _elm_community$list_extra$List_Extra$notMember = function (x) {
	return function (_p63) {
		return !A2(_elm_lang$core$List$member, x, _p63);
	};
};
var _elm_community$list_extra$List_Extra$andThen = _elm_lang$core$List$concatMap;
var _elm_community$list_extra$List_Extra$lift2 = F3(
	function (f, la, lb) {
		return A2(
			_elm_community$list_extra$List_Extra$andThen,
			function (a) {
				return A2(
					_elm_community$list_extra$List_Extra$andThen,
					function (b) {
						return {
							ctor: '::',
							_0: A2(f, a, b),
							_1: {ctor: '[]'}
						};
					},
					lb);
			},
			la);
	});
var _elm_community$list_extra$List_Extra$lift3 = F4(
	function (f, la, lb, lc) {
		return A2(
			_elm_community$list_extra$List_Extra$andThen,
			function (a) {
				return A2(
					_elm_community$list_extra$List_Extra$andThen,
					function (b) {
						return A2(
							_elm_community$list_extra$List_Extra$andThen,
							function (c) {
								return {
									ctor: '::',
									_0: A3(f, a, b, c),
									_1: {ctor: '[]'}
								};
							},
							lc);
					},
					lb);
			},
			la);
	});
var _elm_community$list_extra$List_Extra$lift4 = F5(
	function (f, la, lb, lc, ld) {
		return A2(
			_elm_community$list_extra$List_Extra$andThen,
			function (a) {
				return A2(
					_elm_community$list_extra$List_Extra$andThen,
					function (b) {
						return A2(
							_elm_community$list_extra$List_Extra$andThen,
							function (c) {
								return A2(
									_elm_community$list_extra$List_Extra$andThen,
									function (d) {
										return {
											ctor: '::',
											_0: A4(f, a, b, c, d),
											_1: {ctor: '[]'}
										};
									},
									ld);
							},
							lc);
					},
					lb);
			},
			la);
	});
var _elm_community$list_extra$List_Extra$andMap = F2(
	function (l, fl) {
		return A3(
			_elm_lang$core$List$map2,
			F2(
				function (x, y) {
					return x(y);
				}),
			fl,
			l);
	});
var _elm_community$list_extra$List_Extra$uniqueHelp = F3(
	function (f, existing, remaining) {
		uniqueHelp:
		while (true) {
			var _p64 = remaining;
			if (_p64.ctor === '[]') {
				return {ctor: '[]'};
			} else {
				var _p66 = _p64._1;
				var _p65 = _p64._0;
				var computedFirst = f(_p65);
				if (A2(_elm_lang$core$Set$member, computedFirst, existing)) {
					var _v44 = f,
						_v45 = existing,
						_v46 = _p66;
					f = _v44;
					existing = _v45;
					remaining = _v46;
					continue uniqueHelp;
				} else {
					return {
						ctor: '::',
						_0: _p65,
						_1: A3(
							_elm_community$list_extra$List_Extra$uniqueHelp,
							f,
							A2(_elm_lang$core$Set$insert, computedFirst, existing),
							_p66)
					};
				}
			}
		}
	});
var _elm_community$list_extra$List_Extra$uniqueBy = F2(
	function (f, list) {
		return A3(_elm_community$list_extra$List_Extra$uniqueHelp, f, _elm_lang$core$Set$empty, list);
	});
var _elm_community$list_extra$List_Extra$allDifferentBy = F2(
	function (f, list) {
		return _elm_lang$core$Native_Utils.eq(
			_elm_lang$core$List$length(list),
			_elm_lang$core$List$length(
				A2(_elm_community$list_extra$List_Extra$uniqueBy, f, list)));
	});
var _elm_community$list_extra$List_Extra$allDifferent = function (list) {
	return A2(_elm_community$list_extra$List_Extra$allDifferentBy, _elm_lang$core$Basics$identity, list);
};
var _elm_community$list_extra$List_Extra$unique = function (list) {
	return A3(_elm_community$list_extra$List_Extra$uniqueHelp, _elm_lang$core$Basics$identity, _elm_lang$core$Set$empty, list);
};
var _elm_community$list_extra$List_Extra$dropWhile = F2(
	function (predicate, list) {
		dropWhile:
		while (true) {
			var _p67 = list;
			if (_p67.ctor === '[]') {
				return {ctor: '[]'};
			} else {
				if (predicate(_p67._0)) {
					var _v48 = predicate,
						_v49 = _p67._1;
					predicate = _v48;
					list = _v49;
					continue dropWhile;
				} else {
					return list;
				}
			}
		}
	});
var _elm_community$list_extra$List_Extra$takeWhile = function (predicate) {
	var takeWhileMemo = F2(
		function (memo, list) {
			takeWhileMemo:
			while (true) {
				var _p68 = list;
				if (_p68.ctor === '[]') {
					return _elm_lang$core$List$reverse(memo);
				} else {
					var _p69 = _p68._0;
					if (predicate(_p69)) {
						var _v51 = {ctor: '::', _0: _p69, _1: memo},
							_v52 = _p68._1;
						memo = _v51;
						list = _v52;
						continue takeWhileMemo;
					} else {
						return _elm_lang$core$List$reverse(memo);
					}
				}
			}
		});
	return takeWhileMemo(
		{ctor: '[]'});
};
var _elm_community$list_extra$List_Extra$span = F2(
	function (p, xs) {
		return {
			ctor: '_Tuple2',
			_0: A2(_elm_community$list_extra$List_Extra$takeWhile, p, xs),
			_1: A2(_elm_community$list_extra$List_Extra$dropWhile, p, xs)
		};
	});
var _elm_community$list_extra$List_Extra$break = function (p) {
	return _elm_community$list_extra$List_Extra$span(
		function (_p70) {
			return !p(_p70);
		});
};
var _elm_community$list_extra$List_Extra$groupWhile = F2(
	function (eq, xs_) {
		var _p71 = xs_;
		if (_p71.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var _p73 = _p71._0;
			var _p72 = A2(
				_elm_community$list_extra$List_Extra$span,
				eq(_p73),
				_p71._1);
			var ys = _p72._0;
			var zs = _p72._1;
			return {
				ctor: '::',
				_0: {ctor: '::', _0: _p73, _1: ys},
				_1: A2(_elm_community$list_extra$List_Extra$groupWhile, eq, zs)
			};
		}
	});
var _elm_community$list_extra$List_Extra$group = _elm_community$list_extra$List_Extra$groupWhile(
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.eq(x, y);
		}));
var _elm_community$list_extra$List_Extra$minimumBy = F2(
	function (f, ls) {
		var minBy = F2(
			function (x, _p74) {
				var _p75 = _p74;
				var _p76 = _p75._1;
				var fx = f(x);
				return (_elm_lang$core$Native_Utils.cmp(fx, _p76) < 0) ? {ctor: '_Tuple2', _0: x, _1: fx} : {ctor: '_Tuple2', _0: _p75._0, _1: _p76};
			});
		var _p77 = ls;
		if (_p77.ctor === '::') {
			if (_p77._1.ctor === '[]') {
				return _elm_lang$core$Maybe$Just(_p77._0);
			} else {
				var _p78 = _p77._0;
				return _elm_lang$core$Maybe$Just(
					_elm_lang$core$Tuple$first(
						A3(
							_elm_lang$core$List$foldl,
							minBy,
							{
								ctor: '_Tuple2',
								_0: _p78,
								_1: f(_p78)
							},
							_p77._1)));
			}
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_community$list_extra$List_Extra$maximumBy = F2(
	function (f, ls) {
		var maxBy = F2(
			function (x, _p79) {
				var _p80 = _p79;
				var _p81 = _p80._1;
				var fx = f(x);
				return (_elm_lang$core$Native_Utils.cmp(fx, _p81) > 0) ? {ctor: '_Tuple2', _0: x, _1: fx} : {ctor: '_Tuple2', _0: _p80._0, _1: _p81};
			});
		var _p82 = ls;
		if (_p82.ctor === '::') {
			if (_p82._1.ctor === '[]') {
				return _elm_lang$core$Maybe$Just(_p82._0);
			} else {
				var _p83 = _p82._0;
				return _elm_lang$core$Maybe$Just(
					_elm_lang$core$Tuple$first(
						A3(
							_elm_lang$core$List$foldl,
							maxBy,
							{
								ctor: '_Tuple2',
								_0: _p83,
								_1: f(_p83)
							},
							_p82._1)));
			}
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_community$list_extra$List_Extra$uncons = function (xs) {
	var _p84 = xs;
	if (_p84.ctor === '[]') {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		return _elm_lang$core$Maybe$Just(
			{ctor: '_Tuple2', _0: _p84._0, _1: _p84._1});
	}
};
var _elm_community$list_extra$List_Extra$swapAt = F3(
	function (index1, index2, l) {
		swapAt:
		while (true) {
			if (_elm_lang$core$Native_Utils.eq(index1, index2)) {
				return _elm_lang$core$Maybe$Just(l);
			} else {
				if (_elm_lang$core$Native_Utils.cmp(index1, index2) > 0) {
					var _v59 = index2,
						_v60 = index1,
						_v61 = l;
					index1 = _v59;
					index2 = _v60;
					l = _v61;
					continue swapAt;
				} else {
					if (_elm_lang$core$Native_Utils.cmp(index1, 0) < 0) {
						return _elm_lang$core$Maybe$Nothing;
					} else {
						var _p85 = A2(_elm_community$list_extra$List_Extra$splitAt, index1, l);
						var part1 = _p85._0;
						var tail1 = _p85._1;
						var _p86 = A2(_elm_community$list_extra$List_Extra$splitAt, index2 - index1, tail1);
						var head2 = _p86._0;
						var tail2 = _p86._1;
						return A3(
							_elm_lang$core$Maybe$map2,
							F2(
								function (_p88, _p87) {
									var _p89 = _p88;
									var _p90 = _p87;
									return _elm_lang$core$List$concat(
										{
											ctor: '::',
											_0: part1,
											_1: {
												ctor: '::',
												_0: {ctor: '::', _0: _p90._0, _1: _p89._1},
												_1: {
													ctor: '::',
													_0: {ctor: '::', _0: _p89._0, _1: _p90._1},
													_1: {ctor: '[]'}
												}
											}
										});
								}),
							_elm_community$list_extra$List_Extra$uncons(head2),
							_elm_community$list_extra$List_Extra$uncons(tail2));
					}
				}
			}
		}
	});
var _elm_community$list_extra$List_Extra$iterate = F2(
	function (f, x) {
		var _p91 = f(x);
		if (_p91.ctor === 'Just') {
			return {
				ctor: '::',
				_0: x,
				_1: A2(_elm_community$list_extra$List_Extra$iterate, f, _p91._0)
			};
		} else {
			return {
				ctor: '::',
				_0: x,
				_1: {ctor: '[]'}
			};
		}
	});
var _elm_community$list_extra$List_Extra$getAt = F2(
	function (idx, xs) {
		return (_elm_lang$core$Native_Utils.cmp(idx, 0) < 0) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$List$head(
			A2(_elm_lang$core$List$drop, idx, xs));
	});
var _elm_community$list_extra$List_Extra_ops = _elm_community$list_extra$List_Extra_ops || {};
_elm_community$list_extra$List_Extra_ops['!!'] = _elm_lang$core$Basics$flip(_elm_community$list_extra$List_Extra$getAt);
var _elm_community$list_extra$List_Extra$init = function () {
	var maybe = F2(
		function (d, f) {
			return function (_p92) {
				return A2(
					_elm_lang$core$Maybe$withDefault,
					d,
					A2(_elm_lang$core$Maybe$map, f, _p92));
			};
		});
	return A2(
		_elm_lang$core$List$foldr,
		function (x) {
			return function (_p93) {
				return _elm_lang$core$Maybe$Just(
					A3(
						maybe,
						{ctor: '[]'},
						F2(
							function (x, y) {
								return {ctor: '::', _0: x, _1: y};
							})(x),
						_p93));
			};
		},
		_elm_lang$core$Maybe$Nothing);
}();
var _elm_community$list_extra$List_Extra$last = _elm_community$list_extra$List_Extra$foldl1(
	_elm_lang$core$Basics$flip(_elm_lang$core$Basics$always));

var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

var _elm_lang$core$Process$kill = _elm_lang$core$Native_Scheduler.kill;
var _elm_lang$core$Process$sleep = _elm_lang$core$Native_Scheduler.sleep;
var _elm_lang$core$Process$spawn = _elm_lang$core$Native_Scheduler.spawn;

var _elm_lang$core$Color$fmod = F2(
	function (f, n) {
		var integer = _elm_lang$core$Basics$floor(f);
		return (_elm_lang$core$Basics$toFloat(
			A2(_elm_lang$core$Basics_ops['%'], integer, n)) + f) - _elm_lang$core$Basics$toFloat(integer);
	});
var _elm_lang$core$Color$rgbToHsl = F3(
	function (red, green, blue) {
		var b = _elm_lang$core$Basics$toFloat(blue) / 255;
		var g = _elm_lang$core$Basics$toFloat(green) / 255;
		var r = _elm_lang$core$Basics$toFloat(red) / 255;
		var cMax = A2(
			_elm_lang$core$Basics$max,
			A2(_elm_lang$core$Basics$max, r, g),
			b);
		var cMin = A2(
			_elm_lang$core$Basics$min,
			A2(_elm_lang$core$Basics$min, r, g),
			b);
		var c = cMax - cMin;
		var lightness = (cMax + cMin) / 2;
		var saturation = _elm_lang$core$Native_Utils.eq(lightness, 0) ? 0 : (c / (1 - _elm_lang$core$Basics$abs((2 * lightness) - 1)));
		var hue = _elm_lang$core$Basics$degrees(60) * (_elm_lang$core$Native_Utils.eq(cMax, r) ? A2(_elm_lang$core$Color$fmod, (g - b) / c, 6) : (_elm_lang$core$Native_Utils.eq(cMax, g) ? (((b - r) / c) + 2) : (((r - g) / c) + 4)));
		return {ctor: '_Tuple3', _0: hue, _1: saturation, _2: lightness};
	});
var _elm_lang$core$Color$hslToRgb = F3(
	function (hue, saturation, lightness) {
		var normHue = hue / _elm_lang$core$Basics$degrees(60);
		var chroma = (1 - _elm_lang$core$Basics$abs((2 * lightness) - 1)) * saturation;
		var x = chroma * (1 - _elm_lang$core$Basics$abs(
			A2(_elm_lang$core$Color$fmod, normHue, 2) - 1));
		var _p0 = (_elm_lang$core$Native_Utils.cmp(normHue, 0) < 0) ? {ctor: '_Tuple3', _0: 0, _1: 0, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 1) < 0) ? {ctor: '_Tuple3', _0: chroma, _1: x, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 2) < 0) ? {ctor: '_Tuple3', _0: x, _1: chroma, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 3) < 0) ? {ctor: '_Tuple3', _0: 0, _1: chroma, _2: x} : ((_elm_lang$core$Native_Utils.cmp(normHue, 4) < 0) ? {ctor: '_Tuple3', _0: 0, _1: x, _2: chroma} : ((_elm_lang$core$Native_Utils.cmp(normHue, 5) < 0) ? {ctor: '_Tuple3', _0: x, _1: 0, _2: chroma} : ((_elm_lang$core$Native_Utils.cmp(normHue, 6) < 0) ? {ctor: '_Tuple3', _0: chroma, _1: 0, _2: x} : {ctor: '_Tuple3', _0: 0, _1: 0, _2: 0}))))));
		var r = _p0._0;
		var g = _p0._1;
		var b = _p0._2;
		var m = lightness - (chroma / 2);
		return {ctor: '_Tuple3', _0: r + m, _1: g + m, _2: b + m};
	});
var _elm_lang$core$Color$toRgb = function (color) {
	var _p1 = color;
	if (_p1.ctor === 'RGBA') {
		return {red: _p1._0, green: _p1._1, blue: _p1._2, alpha: _p1._3};
	} else {
		var _p2 = A3(_elm_lang$core$Color$hslToRgb, _p1._0, _p1._1, _p1._2);
		var r = _p2._0;
		var g = _p2._1;
		var b = _p2._2;
		return {
			red: _elm_lang$core$Basics$round(255 * r),
			green: _elm_lang$core$Basics$round(255 * g),
			blue: _elm_lang$core$Basics$round(255 * b),
			alpha: _p1._3
		};
	}
};
var _elm_lang$core$Color$toHsl = function (color) {
	var _p3 = color;
	if (_p3.ctor === 'HSLA') {
		return {hue: _p3._0, saturation: _p3._1, lightness: _p3._2, alpha: _p3._3};
	} else {
		var _p4 = A3(_elm_lang$core$Color$rgbToHsl, _p3._0, _p3._1, _p3._2);
		var h = _p4._0;
		var s = _p4._1;
		var l = _p4._2;
		return {hue: h, saturation: s, lightness: l, alpha: _p3._3};
	}
};
var _elm_lang$core$Color$HSLA = F4(
	function (a, b, c, d) {
		return {ctor: 'HSLA', _0: a, _1: b, _2: c, _3: d};
	});
var _elm_lang$core$Color$hsla = F4(
	function (hue, saturation, lightness, alpha) {
		return A4(
			_elm_lang$core$Color$HSLA,
			hue - _elm_lang$core$Basics$turns(
				_elm_lang$core$Basics$toFloat(
					_elm_lang$core$Basics$floor(hue / (2 * _elm_lang$core$Basics$pi)))),
			saturation,
			lightness,
			alpha);
	});
var _elm_lang$core$Color$hsl = F3(
	function (hue, saturation, lightness) {
		return A4(_elm_lang$core$Color$hsla, hue, saturation, lightness, 1);
	});
var _elm_lang$core$Color$complement = function (color) {
	var _p5 = color;
	if (_p5.ctor === 'HSLA') {
		return A4(
			_elm_lang$core$Color$hsla,
			_p5._0 + _elm_lang$core$Basics$degrees(180),
			_p5._1,
			_p5._2,
			_p5._3);
	} else {
		var _p6 = A3(_elm_lang$core$Color$rgbToHsl, _p5._0, _p5._1, _p5._2);
		var h = _p6._0;
		var s = _p6._1;
		var l = _p6._2;
		return A4(
			_elm_lang$core$Color$hsla,
			h + _elm_lang$core$Basics$degrees(180),
			s,
			l,
			_p5._3);
	}
};
var _elm_lang$core$Color$grayscale = function (p) {
	return A4(_elm_lang$core$Color$HSLA, 0, 0, 1 - p, 1);
};
var _elm_lang$core$Color$greyscale = function (p) {
	return A4(_elm_lang$core$Color$HSLA, 0, 0, 1 - p, 1);
};
var _elm_lang$core$Color$RGBA = F4(
	function (a, b, c, d) {
		return {ctor: 'RGBA', _0: a, _1: b, _2: c, _3: d};
	});
var _elm_lang$core$Color$rgba = _elm_lang$core$Color$RGBA;
var _elm_lang$core$Color$rgb = F3(
	function (r, g, b) {
		return A4(_elm_lang$core$Color$RGBA, r, g, b, 1);
	});
var _elm_lang$core$Color$lightRed = A4(_elm_lang$core$Color$RGBA, 239, 41, 41, 1);
var _elm_lang$core$Color$red = A4(_elm_lang$core$Color$RGBA, 204, 0, 0, 1);
var _elm_lang$core$Color$darkRed = A4(_elm_lang$core$Color$RGBA, 164, 0, 0, 1);
var _elm_lang$core$Color$lightOrange = A4(_elm_lang$core$Color$RGBA, 252, 175, 62, 1);
var _elm_lang$core$Color$orange = A4(_elm_lang$core$Color$RGBA, 245, 121, 0, 1);
var _elm_lang$core$Color$darkOrange = A4(_elm_lang$core$Color$RGBA, 206, 92, 0, 1);
var _elm_lang$core$Color$lightYellow = A4(_elm_lang$core$Color$RGBA, 255, 233, 79, 1);
var _elm_lang$core$Color$yellow = A4(_elm_lang$core$Color$RGBA, 237, 212, 0, 1);
var _elm_lang$core$Color$darkYellow = A4(_elm_lang$core$Color$RGBA, 196, 160, 0, 1);
var _elm_lang$core$Color$lightGreen = A4(_elm_lang$core$Color$RGBA, 138, 226, 52, 1);
var _elm_lang$core$Color$green = A4(_elm_lang$core$Color$RGBA, 115, 210, 22, 1);
var _elm_lang$core$Color$darkGreen = A4(_elm_lang$core$Color$RGBA, 78, 154, 6, 1);
var _elm_lang$core$Color$lightBlue = A4(_elm_lang$core$Color$RGBA, 114, 159, 207, 1);
var _elm_lang$core$Color$blue = A4(_elm_lang$core$Color$RGBA, 52, 101, 164, 1);
var _elm_lang$core$Color$darkBlue = A4(_elm_lang$core$Color$RGBA, 32, 74, 135, 1);
var _elm_lang$core$Color$lightPurple = A4(_elm_lang$core$Color$RGBA, 173, 127, 168, 1);
var _elm_lang$core$Color$purple = A4(_elm_lang$core$Color$RGBA, 117, 80, 123, 1);
var _elm_lang$core$Color$darkPurple = A4(_elm_lang$core$Color$RGBA, 92, 53, 102, 1);
var _elm_lang$core$Color$lightBrown = A4(_elm_lang$core$Color$RGBA, 233, 185, 110, 1);
var _elm_lang$core$Color$brown = A4(_elm_lang$core$Color$RGBA, 193, 125, 17, 1);
var _elm_lang$core$Color$darkBrown = A4(_elm_lang$core$Color$RGBA, 143, 89, 2, 1);
var _elm_lang$core$Color$black = A4(_elm_lang$core$Color$RGBA, 0, 0, 0, 1);
var _elm_lang$core$Color$white = A4(_elm_lang$core$Color$RGBA, 255, 255, 255, 1);
var _elm_lang$core$Color$lightGrey = A4(_elm_lang$core$Color$RGBA, 238, 238, 236, 1);
var _elm_lang$core$Color$grey = A4(_elm_lang$core$Color$RGBA, 211, 215, 207, 1);
var _elm_lang$core$Color$darkGrey = A4(_elm_lang$core$Color$RGBA, 186, 189, 182, 1);
var _elm_lang$core$Color$lightGray = A4(_elm_lang$core$Color$RGBA, 238, 238, 236, 1);
var _elm_lang$core$Color$gray = A4(_elm_lang$core$Color$RGBA, 211, 215, 207, 1);
var _elm_lang$core$Color$darkGray = A4(_elm_lang$core$Color$RGBA, 186, 189, 182, 1);
var _elm_lang$core$Color$lightCharcoal = A4(_elm_lang$core$Color$RGBA, 136, 138, 133, 1);
var _elm_lang$core$Color$charcoal = A4(_elm_lang$core$Color$RGBA, 85, 87, 83, 1);
var _elm_lang$core$Color$darkCharcoal = A4(_elm_lang$core$Color$RGBA, 46, 52, 54, 1);
var _elm_lang$core$Color$Radial = F5(
	function (a, b, c, d, e) {
		return {ctor: 'Radial', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Color$radial = _elm_lang$core$Color$Radial;
var _elm_lang$core$Color$Linear = F3(
	function (a, b, c) {
		return {ctor: 'Linear', _0: a, _1: b, _2: c};
	});
var _elm_lang$core$Color$linear = _elm_lang$core$Color$Linear;

//import Result //

var _elm_lang$core$Native_Date = function() {

function fromString(str)
{
	var date = new Date(str);
	return isNaN(date.getTime())
		? _elm_lang$core$Result$Err('Unable to parse \'' + str + '\' as a date. Dates must be in the ISO 8601 format.')
		: _elm_lang$core$Result$Ok(date);
}

var dayTable = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var monthTable =
	['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


return {
	fromString: fromString,
	year: function(d) { return d.getFullYear(); },
	month: function(d) { return { ctor: monthTable[d.getMonth()] }; },
	day: function(d) { return d.getDate(); },
	hour: function(d) { return d.getHours(); },
	minute: function(d) { return d.getMinutes(); },
	second: function(d) { return d.getSeconds(); },
	millisecond: function(d) { return d.getMilliseconds(); },
	toTime: function(d) { return d.getTime(); },
	fromTime: function(t) { return new Date(t); },
	dayOfWeek: function(d) { return { ctor: dayTable[d.getDay()] }; }
};

}();
var _elm_lang$core$Date$millisecond = _elm_lang$core$Native_Date.millisecond;
var _elm_lang$core$Date$second = _elm_lang$core$Native_Date.second;
var _elm_lang$core$Date$minute = _elm_lang$core$Native_Date.minute;
var _elm_lang$core$Date$hour = _elm_lang$core$Native_Date.hour;
var _elm_lang$core$Date$dayOfWeek = _elm_lang$core$Native_Date.dayOfWeek;
var _elm_lang$core$Date$day = _elm_lang$core$Native_Date.day;
var _elm_lang$core$Date$month = _elm_lang$core$Native_Date.month;
var _elm_lang$core$Date$year = _elm_lang$core$Native_Date.year;
var _elm_lang$core$Date$fromTime = _elm_lang$core$Native_Date.fromTime;
var _elm_lang$core$Date$toTime = _elm_lang$core$Native_Date.toTime;
var _elm_lang$core$Date$fromString = _elm_lang$core$Native_Date.fromString;
var _elm_lang$core$Date$now = A2(_elm_lang$core$Task$map, _elm_lang$core$Date$fromTime, _elm_lang$core$Time$now);
var _elm_lang$core$Date$Date = {ctor: 'Date'};
var _elm_lang$core$Date$Sun = {ctor: 'Sun'};
var _elm_lang$core$Date$Sat = {ctor: 'Sat'};
var _elm_lang$core$Date$Fri = {ctor: 'Fri'};
var _elm_lang$core$Date$Thu = {ctor: 'Thu'};
var _elm_lang$core$Date$Wed = {ctor: 'Wed'};
var _elm_lang$core$Date$Tue = {ctor: 'Tue'};
var _elm_lang$core$Date$Mon = {ctor: 'Mon'};
var _elm_lang$core$Date$Dec = {ctor: 'Dec'};
var _elm_lang$core$Date$Nov = {ctor: 'Nov'};
var _elm_lang$core$Date$Oct = {ctor: 'Oct'};
var _elm_lang$core$Date$Sep = {ctor: 'Sep'};
var _elm_lang$core$Date$Aug = {ctor: 'Aug'};
var _elm_lang$core$Date$Jul = {ctor: 'Jul'};
var _elm_lang$core$Date$Jun = {ctor: 'Jun'};
var _elm_lang$core$Date$May = {ctor: 'May'};
var _elm_lang$core$Date$Apr = {ctor: 'Apr'};
var _elm_lang$core$Date$Mar = {ctor: 'Mar'};
var _elm_lang$core$Date$Feb = {ctor: 'Feb'};
var _elm_lang$core$Date$Jan = {ctor: 'Jan'};

//import Maybe, Native.List //

var _elm_lang$core$Native_Regex = function() {

function escape(str)
{
	return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
function caseInsensitive(re)
{
	return new RegExp(re.source, 'gi');
}
function regex(raw)
{
	return new RegExp(raw, 'g');
}

function contains(re, string)
{
	return string.match(re) !== null;
}

function find(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var out = [];
	var number = 0;
	var string = str;
	var lastIndex = re.lastIndex;
	var prevLastIndex = -1;
	var result;
	while (number++ < n && (result = re.exec(string)))
	{
		if (prevLastIndex === re.lastIndex) break;
		var i = result.length - 1;
		var subs = new Array(i);
		while (i > 0)
		{
			var submatch = result[i];
			subs[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		out.push({
			match: result[0],
			submatches: _elm_lang$core$Native_List.fromArray(subs),
			index: result.index,
			number: number
		});
		prevLastIndex = re.lastIndex;
	}
	re.lastIndex = lastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

function replace(n, re, replacer, string)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var count = 0;
	function jsReplacer(match)
	{
		if (count++ >= n)
		{
			return match;
		}
		var i = arguments.length - 3;
		var submatches = new Array(i);
		while (i > 0)
		{
			var submatch = arguments[i];
			submatches[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		return replacer({
			match: match,
			submatches: _elm_lang$core$Native_List.fromArray(submatches),
			index: arguments[arguments.length - 2],
			number: count
		});
	}
	return string.replace(re, jsReplacer);
}

function split(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	if (n === Infinity)
	{
		return _elm_lang$core$Native_List.fromArray(str.split(re));
	}
	var string = str;
	var result;
	var out = [];
	var start = re.lastIndex;
	var restoreLastIndex = re.lastIndex;
	while (n--)
	{
		if (!(result = re.exec(string))) break;
		out.push(string.slice(start, result.index));
		start = re.lastIndex;
	}
	out.push(string.slice(start));
	re.lastIndex = restoreLastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

return {
	regex: regex,
	caseInsensitive: caseInsensitive,
	escape: escape,

	contains: F2(contains),
	find: F3(find),
	replace: F4(replace),
	split: F3(split)
};

}();

var _elm_lang$core$Regex$split = _elm_lang$core$Native_Regex.split;
var _elm_lang$core$Regex$replace = _elm_lang$core$Native_Regex.replace;
var _elm_lang$core$Regex$find = _elm_lang$core$Native_Regex.find;
var _elm_lang$core$Regex$contains = _elm_lang$core$Native_Regex.contains;
var _elm_lang$core$Regex$caseInsensitive = _elm_lang$core$Native_Regex.caseInsensitive;
var _elm_lang$core$Regex$regex = _elm_lang$core$Native_Regex.regex;
var _elm_lang$core$Regex$escape = _elm_lang$core$Native_Regex.escape;
var _elm_lang$core$Regex$Match = F4(
	function (a, b, c, d) {
		return {match: a, submatches: b, index: c, number: d};
	});
var _elm_lang$core$Regex$Regex = {ctor: 'Regex'};
var _elm_lang$core$Regex$AtMost = function (a) {
	return {ctor: 'AtMost', _0: a};
};
var _elm_lang$core$Regex$All = {ctor: 'All'};

var _elm_lang$dom$Native_Dom = function() {

var fakeNode = {
	addEventListener: function() {},
	removeEventListener: function() {}
};

var onDocument = on(typeof document !== 'undefined' ? document : fakeNode);
var onWindow = on(typeof window !== 'undefined' ? window : fakeNode);

function on(node)
{
	return function(eventName, decoder, toTask)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {

			function performTask(event)
			{
				var result = A2(_elm_lang$core$Json_Decode$decodeValue, decoder, event);
				if (result.ctor === 'Ok')
				{
					_elm_lang$core$Native_Scheduler.rawSpawn(toTask(result._0));
				}
			}

			node.addEventListener(eventName, performTask);

			return function()
			{
				node.removeEventListener(eventName, performTask);
			};
		});
	};
}

var rAF = typeof requestAnimationFrame !== 'undefined'
	? requestAnimationFrame
	: function(callback) { callback(); };

function withNode(id, doStuff)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		rAF(function()
		{
			var node = document.getElementById(id);
			if (node === null)
			{
				callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NotFound', _0: id }));
				return;
			}
			callback(_elm_lang$core$Native_Scheduler.succeed(doStuff(node)));
		});
	});
}


// FOCUS

function focus(id)
{
	return withNode(id, function(node) {
		node.focus();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function blur(id)
{
	return withNode(id, function(node) {
		node.blur();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SCROLLING

function getScrollTop(id)
{
	return withNode(id, function(node) {
		return node.scrollTop;
	});
}

function setScrollTop(id, desiredScrollTop)
{
	return withNode(id, function(node) {
		node.scrollTop = desiredScrollTop;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toBottom(id)
{
	return withNode(id, function(node) {
		node.scrollTop = node.scrollHeight;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function getScrollLeft(id)
{
	return withNode(id, function(node) {
		return node.scrollLeft;
	});
}

function setScrollLeft(id, desiredScrollLeft)
{
	return withNode(id, function(node) {
		node.scrollLeft = desiredScrollLeft;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toRight(id)
{
	return withNode(id, function(node) {
		node.scrollLeft = node.scrollWidth;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SIZE

function width(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollWidth;
			case 'VisibleContent':
				return node.clientWidth;
			case 'VisibleContentWithBorders':
				return node.offsetWidth;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.right - rect.left;
		}
	});
}

function height(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollHeight;
			case 'VisibleContent':
				return node.clientHeight;
			case 'VisibleContentWithBorders':
				return node.offsetHeight;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.bottom - rect.top;
		}
	});
}

return {
	onDocument: F3(onDocument),
	onWindow: F3(onWindow),

	focus: focus,
	blur: blur,

	getScrollTop: getScrollTop,
	setScrollTop: F2(setScrollTop),
	getScrollLeft: getScrollLeft,
	setScrollLeft: F2(setScrollLeft),
	toBottom: toBottom,
	toRight: toRight,

	height: F2(height),
	width: F2(width)
};

}();

var _elm_lang$dom$Dom_LowLevel$onWindow = _elm_lang$dom$Native_Dom.onWindow;
var _elm_lang$dom$Dom_LowLevel$onDocument = _elm_lang$dom$Native_Dom.onDocument;

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (a.options !== b.options)
	{
		if (a.options.stopPropagation !== b.options.stopPropagation || a.options.preventDefault !== b.options.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'checked',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'value',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _elm_lang$html$Html_Keyed$node = _elm_lang$virtual_dom$VirtualDom$keyedNode;
var _elm_lang$html$Html_Keyed$ol = _elm_lang$html$Html_Keyed$node('ol');
var _elm_lang$html$Html_Keyed$ul = _elm_lang$html$Html_Keyed$node('ul');

var _elm_lang$svg$Svg$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$svg$Svg$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$svg$Svg$svgNamespace = A2(
	_elm_lang$virtual_dom$VirtualDom$property,
	'namespace',
	_elm_lang$core$Json_Encode$string('http://www.w3.org/2000/svg'));
var _elm_lang$svg$Svg$node = F3(
	function (name, attributes, children) {
		return A3(
			_elm_lang$virtual_dom$VirtualDom$node,
			name,
			{ctor: '::', _0: _elm_lang$svg$Svg$svgNamespace, _1: attributes},
			children);
	});
var _elm_lang$svg$Svg$svg = _elm_lang$svg$Svg$node('svg');
var _elm_lang$svg$Svg$foreignObject = _elm_lang$svg$Svg$node('foreignObject');
var _elm_lang$svg$Svg$animate = _elm_lang$svg$Svg$node('animate');
var _elm_lang$svg$Svg$animateColor = _elm_lang$svg$Svg$node('animateColor');
var _elm_lang$svg$Svg$animateMotion = _elm_lang$svg$Svg$node('animateMotion');
var _elm_lang$svg$Svg$animateTransform = _elm_lang$svg$Svg$node('animateTransform');
var _elm_lang$svg$Svg$mpath = _elm_lang$svg$Svg$node('mpath');
var _elm_lang$svg$Svg$set = _elm_lang$svg$Svg$node('set');
var _elm_lang$svg$Svg$a = _elm_lang$svg$Svg$node('a');
var _elm_lang$svg$Svg$defs = _elm_lang$svg$Svg$node('defs');
var _elm_lang$svg$Svg$g = _elm_lang$svg$Svg$node('g');
var _elm_lang$svg$Svg$marker = _elm_lang$svg$Svg$node('marker');
var _elm_lang$svg$Svg$mask = _elm_lang$svg$Svg$node('mask');
var _elm_lang$svg$Svg$pattern = _elm_lang$svg$Svg$node('pattern');
var _elm_lang$svg$Svg$switch = _elm_lang$svg$Svg$node('switch');
var _elm_lang$svg$Svg$symbol = _elm_lang$svg$Svg$node('symbol');
var _elm_lang$svg$Svg$desc = _elm_lang$svg$Svg$node('desc');
var _elm_lang$svg$Svg$metadata = _elm_lang$svg$Svg$node('metadata');
var _elm_lang$svg$Svg$title = _elm_lang$svg$Svg$node('title');
var _elm_lang$svg$Svg$feBlend = _elm_lang$svg$Svg$node('feBlend');
var _elm_lang$svg$Svg$feColorMatrix = _elm_lang$svg$Svg$node('feColorMatrix');
var _elm_lang$svg$Svg$feComponentTransfer = _elm_lang$svg$Svg$node('feComponentTransfer');
var _elm_lang$svg$Svg$feComposite = _elm_lang$svg$Svg$node('feComposite');
var _elm_lang$svg$Svg$feConvolveMatrix = _elm_lang$svg$Svg$node('feConvolveMatrix');
var _elm_lang$svg$Svg$feDiffuseLighting = _elm_lang$svg$Svg$node('feDiffuseLighting');
var _elm_lang$svg$Svg$feDisplacementMap = _elm_lang$svg$Svg$node('feDisplacementMap');
var _elm_lang$svg$Svg$feFlood = _elm_lang$svg$Svg$node('feFlood');
var _elm_lang$svg$Svg$feFuncA = _elm_lang$svg$Svg$node('feFuncA');
var _elm_lang$svg$Svg$feFuncB = _elm_lang$svg$Svg$node('feFuncB');
var _elm_lang$svg$Svg$feFuncG = _elm_lang$svg$Svg$node('feFuncG');
var _elm_lang$svg$Svg$feFuncR = _elm_lang$svg$Svg$node('feFuncR');
var _elm_lang$svg$Svg$feGaussianBlur = _elm_lang$svg$Svg$node('feGaussianBlur');
var _elm_lang$svg$Svg$feImage = _elm_lang$svg$Svg$node('feImage');
var _elm_lang$svg$Svg$feMerge = _elm_lang$svg$Svg$node('feMerge');
var _elm_lang$svg$Svg$feMergeNode = _elm_lang$svg$Svg$node('feMergeNode');
var _elm_lang$svg$Svg$feMorphology = _elm_lang$svg$Svg$node('feMorphology');
var _elm_lang$svg$Svg$feOffset = _elm_lang$svg$Svg$node('feOffset');
var _elm_lang$svg$Svg$feSpecularLighting = _elm_lang$svg$Svg$node('feSpecularLighting');
var _elm_lang$svg$Svg$feTile = _elm_lang$svg$Svg$node('feTile');
var _elm_lang$svg$Svg$feTurbulence = _elm_lang$svg$Svg$node('feTurbulence');
var _elm_lang$svg$Svg$font = _elm_lang$svg$Svg$node('font');
var _elm_lang$svg$Svg$linearGradient = _elm_lang$svg$Svg$node('linearGradient');
var _elm_lang$svg$Svg$radialGradient = _elm_lang$svg$Svg$node('radialGradient');
var _elm_lang$svg$Svg$stop = _elm_lang$svg$Svg$node('stop');
var _elm_lang$svg$Svg$circle = _elm_lang$svg$Svg$node('circle');
var _elm_lang$svg$Svg$ellipse = _elm_lang$svg$Svg$node('ellipse');
var _elm_lang$svg$Svg$image = _elm_lang$svg$Svg$node('image');
var _elm_lang$svg$Svg$line = _elm_lang$svg$Svg$node('line');
var _elm_lang$svg$Svg$path = _elm_lang$svg$Svg$node('path');
var _elm_lang$svg$Svg$polygon = _elm_lang$svg$Svg$node('polygon');
var _elm_lang$svg$Svg$polyline = _elm_lang$svg$Svg$node('polyline');
var _elm_lang$svg$Svg$rect = _elm_lang$svg$Svg$node('rect');
var _elm_lang$svg$Svg$use = _elm_lang$svg$Svg$node('use');
var _elm_lang$svg$Svg$feDistantLight = _elm_lang$svg$Svg$node('feDistantLight');
var _elm_lang$svg$Svg$fePointLight = _elm_lang$svg$Svg$node('fePointLight');
var _elm_lang$svg$Svg$feSpotLight = _elm_lang$svg$Svg$node('feSpotLight');
var _elm_lang$svg$Svg$altGlyph = _elm_lang$svg$Svg$node('altGlyph');
var _elm_lang$svg$Svg$altGlyphDef = _elm_lang$svg$Svg$node('altGlyphDef');
var _elm_lang$svg$Svg$altGlyphItem = _elm_lang$svg$Svg$node('altGlyphItem');
var _elm_lang$svg$Svg$glyph = _elm_lang$svg$Svg$node('glyph');
var _elm_lang$svg$Svg$glyphRef = _elm_lang$svg$Svg$node('glyphRef');
var _elm_lang$svg$Svg$textPath = _elm_lang$svg$Svg$node('textPath');
var _elm_lang$svg$Svg$text_ = _elm_lang$svg$Svg$node('text');
var _elm_lang$svg$Svg$tref = _elm_lang$svg$Svg$node('tref');
var _elm_lang$svg$Svg$tspan = _elm_lang$svg$Svg$node('tspan');
var _elm_lang$svg$Svg$clipPath = _elm_lang$svg$Svg$node('clipPath');
var _elm_lang$svg$Svg$colorProfile = _elm_lang$svg$Svg$node('colorProfile');
var _elm_lang$svg$Svg$cursor = _elm_lang$svg$Svg$node('cursor');
var _elm_lang$svg$Svg$filter = _elm_lang$svg$Svg$node('filter');
var _elm_lang$svg$Svg$script = _elm_lang$svg$Svg$node('script');
var _elm_lang$svg$Svg$style = _elm_lang$svg$Svg$node('style');
var _elm_lang$svg$Svg$view = _elm_lang$svg$Svg$node('view');

var _elm_lang$svg$Svg_Attributes$writingMode = _elm_lang$virtual_dom$VirtualDom$attribute('writing-mode');
var _elm_lang$svg$Svg_Attributes$wordSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('word-spacing');
var _elm_lang$svg$Svg_Attributes$visibility = _elm_lang$virtual_dom$VirtualDom$attribute('visibility');
var _elm_lang$svg$Svg_Attributes$unicodeBidi = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-bidi');
var _elm_lang$svg$Svg_Attributes$textRendering = _elm_lang$virtual_dom$VirtualDom$attribute('text-rendering');
var _elm_lang$svg$Svg_Attributes$textDecoration = _elm_lang$virtual_dom$VirtualDom$attribute('text-decoration');
var _elm_lang$svg$Svg_Attributes$textAnchor = _elm_lang$virtual_dom$VirtualDom$attribute('text-anchor');
var _elm_lang$svg$Svg_Attributes$stroke = _elm_lang$virtual_dom$VirtualDom$attribute('stroke');
var _elm_lang$svg$Svg_Attributes$strokeWidth = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-width');
var _elm_lang$svg$Svg_Attributes$strokeOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-opacity');
var _elm_lang$svg$Svg_Attributes$strokeMiterlimit = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-miterlimit');
var _elm_lang$svg$Svg_Attributes$strokeLinejoin = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linejoin');
var _elm_lang$svg$Svg_Attributes$strokeLinecap = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linecap');
var _elm_lang$svg$Svg_Attributes$strokeDashoffset = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dashoffset');
var _elm_lang$svg$Svg_Attributes$strokeDasharray = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dasharray');
var _elm_lang$svg$Svg_Attributes$stopOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stop-opacity');
var _elm_lang$svg$Svg_Attributes$stopColor = _elm_lang$virtual_dom$VirtualDom$attribute('stop-color');
var _elm_lang$svg$Svg_Attributes$shapeRendering = _elm_lang$virtual_dom$VirtualDom$attribute('shape-rendering');
var _elm_lang$svg$Svg_Attributes$pointerEvents = _elm_lang$virtual_dom$VirtualDom$attribute('pointer-events');
var _elm_lang$svg$Svg_Attributes$overflow = _elm_lang$virtual_dom$VirtualDom$attribute('overflow');
var _elm_lang$svg$Svg_Attributes$opacity = _elm_lang$virtual_dom$VirtualDom$attribute('opacity');
var _elm_lang$svg$Svg_Attributes$mask = _elm_lang$virtual_dom$VirtualDom$attribute('mask');
var _elm_lang$svg$Svg_Attributes$markerStart = _elm_lang$virtual_dom$VirtualDom$attribute('marker-start');
var _elm_lang$svg$Svg_Attributes$markerMid = _elm_lang$virtual_dom$VirtualDom$attribute('marker-mid');
var _elm_lang$svg$Svg_Attributes$markerEnd = _elm_lang$virtual_dom$VirtualDom$attribute('marker-end');
var _elm_lang$svg$Svg_Attributes$lightingColor = _elm_lang$virtual_dom$VirtualDom$attribute('lighting-color');
var _elm_lang$svg$Svg_Attributes$letterSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('letter-spacing');
var _elm_lang$svg$Svg_Attributes$kerning = _elm_lang$virtual_dom$VirtualDom$attribute('kerning');
var _elm_lang$svg$Svg_Attributes$imageRendering = _elm_lang$virtual_dom$VirtualDom$attribute('image-rendering');
var _elm_lang$svg$Svg_Attributes$glyphOrientationVertical = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-vertical');
var _elm_lang$svg$Svg_Attributes$glyphOrientationHorizontal = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-horizontal');
var _elm_lang$svg$Svg_Attributes$fontWeight = _elm_lang$virtual_dom$VirtualDom$attribute('font-weight');
var _elm_lang$svg$Svg_Attributes$fontVariant = _elm_lang$virtual_dom$VirtualDom$attribute('font-variant');
var _elm_lang$svg$Svg_Attributes$fontStyle = _elm_lang$virtual_dom$VirtualDom$attribute('font-style');
var _elm_lang$svg$Svg_Attributes$fontStretch = _elm_lang$virtual_dom$VirtualDom$attribute('font-stretch');
var _elm_lang$svg$Svg_Attributes$fontSize = _elm_lang$virtual_dom$VirtualDom$attribute('font-size');
var _elm_lang$svg$Svg_Attributes$fontSizeAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('font-size-adjust');
var _elm_lang$svg$Svg_Attributes$fontFamily = _elm_lang$virtual_dom$VirtualDom$attribute('font-family');
var _elm_lang$svg$Svg_Attributes$floodOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('flood-opacity');
var _elm_lang$svg$Svg_Attributes$floodColor = _elm_lang$virtual_dom$VirtualDom$attribute('flood-color');
var _elm_lang$svg$Svg_Attributes$filter = _elm_lang$virtual_dom$VirtualDom$attribute('filter');
var _elm_lang$svg$Svg_Attributes$fill = _elm_lang$virtual_dom$VirtualDom$attribute('fill');
var _elm_lang$svg$Svg_Attributes$fillRule = _elm_lang$virtual_dom$VirtualDom$attribute('fill-rule');
var _elm_lang$svg$Svg_Attributes$fillOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('fill-opacity');
var _elm_lang$svg$Svg_Attributes$enableBackground = _elm_lang$virtual_dom$VirtualDom$attribute('enable-background');
var _elm_lang$svg$Svg_Attributes$dominantBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('dominant-baseline');
var _elm_lang$svg$Svg_Attributes$display = _elm_lang$virtual_dom$VirtualDom$attribute('display');
var _elm_lang$svg$Svg_Attributes$direction = _elm_lang$virtual_dom$VirtualDom$attribute('direction');
var _elm_lang$svg$Svg_Attributes$cursor = _elm_lang$virtual_dom$VirtualDom$attribute('cursor');
var _elm_lang$svg$Svg_Attributes$color = _elm_lang$virtual_dom$VirtualDom$attribute('color');
var _elm_lang$svg$Svg_Attributes$colorRendering = _elm_lang$virtual_dom$VirtualDom$attribute('color-rendering');
var _elm_lang$svg$Svg_Attributes$colorProfile = _elm_lang$virtual_dom$VirtualDom$attribute('color-profile');
var _elm_lang$svg$Svg_Attributes$colorInterpolation = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation');
var _elm_lang$svg$Svg_Attributes$colorInterpolationFilters = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation-filters');
var _elm_lang$svg$Svg_Attributes$clip = _elm_lang$virtual_dom$VirtualDom$attribute('clip');
var _elm_lang$svg$Svg_Attributes$clipRule = _elm_lang$virtual_dom$VirtualDom$attribute('clip-rule');
var _elm_lang$svg$Svg_Attributes$clipPath = _elm_lang$virtual_dom$VirtualDom$attribute('clip-path');
var _elm_lang$svg$Svg_Attributes$baselineShift = _elm_lang$virtual_dom$VirtualDom$attribute('baseline-shift');
var _elm_lang$svg$Svg_Attributes$alignmentBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('alignment-baseline');
var _elm_lang$svg$Svg_Attributes$zoomAndPan = _elm_lang$virtual_dom$VirtualDom$attribute('zoomAndPan');
var _elm_lang$svg$Svg_Attributes$z = _elm_lang$virtual_dom$VirtualDom$attribute('z');
var _elm_lang$svg$Svg_Attributes$yChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('yChannelSelector');
var _elm_lang$svg$Svg_Attributes$y2 = _elm_lang$virtual_dom$VirtualDom$attribute('y2');
var _elm_lang$svg$Svg_Attributes$y1 = _elm_lang$virtual_dom$VirtualDom$attribute('y1');
var _elm_lang$svg$Svg_Attributes$y = _elm_lang$virtual_dom$VirtualDom$attribute('y');
var _elm_lang$svg$Svg_Attributes$xmlSpace = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:space');
var _elm_lang$svg$Svg_Attributes$xmlLang = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:lang');
var _elm_lang$svg$Svg_Attributes$xmlBase = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:base');
var _elm_lang$svg$Svg_Attributes$xlinkType = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:type');
var _elm_lang$svg$Svg_Attributes$xlinkTitle = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:title');
var _elm_lang$svg$Svg_Attributes$xlinkShow = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:show');
var _elm_lang$svg$Svg_Attributes$xlinkRole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:role');
var _elm_lang$svg$Svg_Attributes$xlinkHref = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:href');
var _elm_lang$svg$Svg_Attributes$xlinkArcrole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:arcrole');
var _elm_lang$svg$Svg_Attributes$xlinkActuate = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:actuate');
var _elm_lang$svg$Svg_Attributes$xChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('xChannelSelector');
var _elm_lang$svg$Svg_Attributes$x2 = _elm_lang$virtual_dom$VirtualDom$attribute('x2');
var _elm_lang$svg$Svg_Attributes$x1 = _elm_lang$virtual_dom$VirtualDom$attribute('x1');
var _elm_lang$svg$Svg_Attributes$xHeight = _elm_lang$virtual_dom$VirtualDom$attribute('x-height');
var _elm_lang$svg$Svg_Attributes$x = _elm_lang$virtual_dom$VirtualDom$attribute('x');
var _elm_lang$svg$Svg_Attributes$widths = _elm_lang$virtual_dom$VirtualDom$attribute('widths');
var _elm_lang$svg$Svg_Attributes$width = _elm_lang$virtual_dom$VirtualDom$attribute('width');
var _elm_lang$svg$Svg_Attributes$viewTarget = _elm_lang$virtual_dom$VirtualDom$attribute('viewTarget');
var _elm_lang$svg$Svg_Attributes$viewBox = _elm_lang$virtual_dom$VirtualDom$attribute('viewBox');
var _elm_lang$svg$Svg_Attributes$vertOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-y');
var _elm_lang$svg$Svg_Attributes$vertOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-x');
var _elm_lang$svg$Svg_Attributes$vertAdvY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-adv-y');
var _elm_lang$svg$Svg_Attributes$version = _elm_lang$virtual_dom$VirtualDom$attribute('version');
var _elm_lang$svg$Svg_Attributes$values = _elm_lang$virtual_dom$VirtualDom$attribute('values');
var _elm_lang$svg$Svg_Attributes$vMathematical = _elm_lang$virtual_dom$VirtualDom$attribute('v-mathematical');
var _elm_lang$svg$Svg_Attributes$vIdeographic = _elm_lang$virtual_dom$VirtualDom$attribute('v-ideographic');
var _elm_lang$svg$Svg_Attributes$vHanging = _elm_lang$virtual_dom$VirtualDom$attribute('v-hanging');
var _elm_lang$svg$Svg_Attributes$vAlphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('v-alphabetic');
var _elm_lang$svg$Svg_Attributes$unitsPerEm = _elm_lang$virtual_dom$VirtualDom$attribute('units-per-em');
var _elm_lang$svg$Svg_Attributes$unicodeRange = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-range');
var _elm_lang$svg$Svg_Attributes$unicode = _elm_lang$virtual_dom$VirtualDom$attribute('unicode');
var _elm_lang$svg$Svg_Attributes$underlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('underline-thickness');
var _elm_lang$svg$Svg_Attributes$underlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('underline-position');
var _elm_lang$svg$Svg_Attributes$u2 = _elm_lang$virtual_dom$VirtualDom$attribute('u2');
var _elm_lang$svg$Svg_Attributes$u1 = _elm_lang$virtual_dom$VirtualDom$attribute('u1');
var _elm_lang$svg$Svg_Attributes$type_ = _elm_lang$virtual_dom$VirtualDom$attribute('type');
var _elm_lang$svg$Svg_Attributes$transform = _elm_lang$virtual_dom$VirtualDom$attribute('transform');
var _elm_lang$svg$Svg_Attributes$to = _elm_lang$virtual_dom$VirtualDom$attribute('to');
var _elm_lang$svg$Svg_Attributes$title = _elm_lang$virtual_dom$VirtualDom$attribute('title');
var _elm_lang$svg$Svg_Attributes$textLength = _elm_lang$virtual_dom$VirtualDom$attribute('textLength');
var _elm_lang$svg$Svg_Attributes$targetY = _elm_lang$virtual_dom$VirtualDom$attribute('targetY');
var _elm_lang$svg$Svg_Attributes$targetX = _elm_lang$virtual_dom$VirtualDom$attribute('targetX');
var _elm_lang$svg$Svg_Attributes$target = _elm_lang$virtual_dom$VirtualDom$attribute('target');
var _elm_lang$svg$Svg_Attributes$tableValues = _elm_lang$virtual_dom$VirtualDom$attribute('tableValues');
var _elm_lang$svg$Svg_Attributes$systemLanguage = _elm_lang$virtual_dom$VirtualDom$attribute('systemLanguage');
var _elm_lang$svg$Svg_Attributes$surfaceScale = _elm_lang$virtual_dom$VirtualDom$attribute('surfaceScale');
var _elm_lang$svg$Svg_Attributes$style = _elm_lang$virtual_dom$VirtualDom$attribute('style');
var _elm_lang$svg$Svg_Attributes$string = _elm_lang$virtual_dom$VirtualDom$attribute('string');
var _elm_lang$svg$Svg_Attributes$strikethroughThickness = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-thickness');
var _elm_lang$svg$Svg_Attributes$strikethroughPosition = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-position');
var _elm_lang$svg$Svg_Attributes$stitchTiles = _elm_lang$virtual_dom$VirtualDom$attribute('stitchTiles');
var _elm_lang$svg$Svg_Attributes$stemv = _elm_lang$virtual_dom$VirtualDom$attribute('stemv');
var _elm_lang$svg$Svg_Attributes$stemh = _elm_lang$virtual_dom$VirtualDom$attribute('stemh');
var _elm_lang$svg$Svg_Attributes$stdDeviation = _elm_lang$virtual_dom$VirtualDom$attribute('stdDeviation');
var _elm_lang$svg$Svg_Attributes$startOffset = _elm_lang$virtual_dom$VirtualDom$attribute('startOffset');
var _elm_lang$svg$Svg_Attributes$spreadMethod = _elm_lang$virtual_dom$VirtualDom$attribute('spreadMethod');
var _elm_lang$svg$Svg_Attributes$speed = _elm_lang$virtual_dom$VirtualDom$attribute('speed');
var _elm_lang$svg$Svg_Attributes$specularExponent = _elm_lang$virtual_dom$VirtualDom$attribute('specularExponent');
var _elm_lang$svg$Svg_Attributes$specularConstant = _elm_lang$virtual_dom$VirtualDom$attribute('specularConstant');
var _elm_lang$svg$Svg_Attributes$spacing = _elm_lang$virtual_dom$VirtualDom$attribute('spacing');
var _elm_lang$svg$Svg_Attributes$slope = _elm_lang$virtual_dom$VirtualDom$attribute('slope');
var _elm_lang$svg$Svg_Attributes$seed = _elm_lang$virtual_dom$VirtualDom$attribute('seed');
var _elm_lang$svg$Svg_Attributes$scale = _elm_lang$virtual_dom$VirtualDom$attribute('scale');
var _elm_lang$svg$Svg_Attributes$ry = _elm_lang$virtual_dom$VirtualDom$attribute('ry');
var _elm_lang$svg$Svg_Attributes$rx = _elm_lang$virtual_dom$VirtualDom$attribute('rx');
var _elm_lang$svg$Svg_Attributes$rotate = _elm_lang$virtual_dom$VirtualDom$attribute('rotate');
var _elm_lang$svg$Svg_Attributes$result = _elm_lang$virtual_dom$VirtualDom$attribute('result');
var _elm_lang$svg$Svg_Attributes$restart = _elm_lang$virtual_dom$VirtualDom$attribute('restart');
var _elm_lang$svg$Svg_Attributes$requiredFeatures = _elm_lang$virtual_dom$VirtualDom$attribute('requiredFeatures');
var _elm_lang$svg$Svg_Attributes$requiredExtensions = _elm_lang$virtual_dom$VirtualDom$attribute('requiredExtensions');
var _elm_lang$svg$Svg_Attributes$repeatDur = _elm_lang$virtual_dom$VirtualDom$attribute('repeatDur');
var _elm_lang$svg$Svg_Attributes$repeatCount = _elm_lang$virtual_dom$VirtualDom$attribute('repeatCount');
var _elm_lang$svg$Svg_Attributes$renderingIntent = _elm_lang$virtual_dom$VirtualDom$attribute('rendering-intent');
var _elm_lang$svg$Svg_Attributes$refY = _elm_lang$virtual_dom$VirtualDom$attribute('refY');
var _elm_lang$svg$Svg_Attributes$refX = _elm_lang$virtual_dom$VirtualDom$attribute('refX');
var _elm_lang$svg$Svg_Attributes$radius = _elm_lang$virtual_dom$VirtualDom$attribute('radius');
var _elm_lang$svg$Svg_Attributes$r = _elm_lang$virtual_dom$VirtualDom$attribute('r');
var _elm_lang$svg$Svg_Attributes$primitiveUnits = _elm_lang$virtual_dom$VirtualDom$attribute('primitiveUnits');
var _elm_lang$svg$Svg_Attributes$preserveAspectRatio = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAspectRatio');
var _elm_lang$svg$Svg_Attributes$preserveAlpha = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAlpha');
var _elm_lang$svg$Svg_Attributes$pointsAtZ = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtZ');
var _elm_lang$svg$Svg_Attributes$pointsAtY = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtY');
var _elm_lang$svg$Svg_Attributes$pointsAtX = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtX');
var _elm_lang$svg$Svg_Attributes$points = _elm_lang$virtual_dom$VirtualDom$attribute('points');
var _elm_lang$svg$Svg_Attributes$pointOrder = _elm_lang$virtual_dom$VirtualDom$attribute('point-order');
var _elm_lang$svg$Svg_Attributes$patternUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternUnits');
var _elm_lang$svg$Svg_Attributes$patternTransform = _elm_lang$virtual_dom$VirtualDom$attribute('patternTransform');
var _elm_lang$svg$Svg_Attributes$patternContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternContentUnits');
var _elm_lang$svg$Svg_Attributes$pathLength = _elm_lang$virtual_dom$VirtualDom$attribute('pathLength');
var _elm_lang$svg$Svg_Attributes$path = _elm_lang$virtual_dom$VirtualDom$attribute('path');
var _elm_lang$svg$Svg_Attributes$panose1 = _elm_lang$virtual_dom$VirtualDom$attribute('panose-1');
var _elm_lang$svg$Svg_Attributes$overlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('overline-thickness');
var _elm_lang$svg$Svg_Attributes$overlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('overline-position');
var _elm_lang$svg$Svg_Attributes$origin = _elm_lang$virtual_dom$VirtualDom$attribute('origin');
var _elm_lang$svg$Svg_Attributes$orientation = _elm_lang$virtual_dom$VirtualDom$attribute('orientation');
var _elm_lang$svg$Svg_Attributes$orient = _elm_lang$virtual_dom$VirtualDom$attribute('orient');
var _elm_lang$svg$Svg_Attributes$order = _elm_lang$virtual_dom$VirtualDom$attribute('order');
var _elm_lang$svg$Svg_Attributes$operator = _elm_lang$virtual_dom$VirtualDom$attribute('operator');
var _elm_lang$svg$Svg_Attributes$offset = _elm_lang$virtual_dom$VirtualDom$attribute('offset');
var _elm_lang$svg$Svg_Attributes$numOctaves = _elm_lang$virtual_dom$VirtualDom$attribute('numOctaves');
var _elm_lang$svg$Svg_Attributes$name = _elm_lang$virtual_dom$VirtualDom$attribute('name');
var _elm_lang$svg$Svg_Attributes$mode = _elm_lang$virtual_dom$VirtualDom$attribute('mode');
var _elm_lang$svg$Svg_Attributes$min = _elm_lang$virtual_dom$VirtualDom$attribute('min');
var _elm_lang$svg$Svg_Attributes$method = _elm_lang$virtual_dom$VirtualDom$attribute('method');
var _elm_lang$svg$Svg_Attributes$media = _elm_lang$virtual_dom$VirtualDom$attribute('media');
var _elm_lang$svg$Svg_Attributes$max = _elm_lang$virtual_dom$VirtualDom$attribute('max');
var _elm_lang$svg$Svg_Attributes$mathematical = _elm_lang$virtual_dom$VirtualDom$attribute('mathematical');
var _elm_lang$svg$Svg_Attributes$maskUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskUnits');
var _elm_lang$svg$Svg_Attributes$maskContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskContentUnits');
var _elm_lang$svg$Svg_Attributes$markerWidth = _elm_lang$virtual_dom$VirtualDom$attribute('markerWidth');
var _elm_lang$svg$Svg_Attributes$markerUnits = _elm_lang$virtual_dom$VirtualDom$attribute('markerUnits');
var _elm_lang$svg$Svg_Attributes$markerHeight = _elm_lang$virtual_dom$VirtualDom$attribute('markerHeight');
var _elm_lang$svg$Svg_Attributes$local = _elm_lang$virtual_dom$VirtualDom$attribute('local');
var _elm_lang$svg$Svg_Attributes$limitingConeAngle = _elm_lang$virtual_dom$VirtualDom$attribute('limitingConeAngle');
var _elm_lang$svg$Svg_Attributes$lengthAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('lengthAdjust');
var _elm_lang$svg$Svg_Attributes$lang = _elm_lang$virtual_dom$VirtualDom$attribute('lang');
var _elm_lang$svg$Svg_Attributes$keyTimes = _elm_lang$virtual_dom$VirtualDom$attribute('keyTimes');
var _elm_lang$svg$Svg_Attributes$keySplines = _elm_lang$virtual_dom$VirtualDom$attribute('keySplines');
var _elm_lang$svg$Svg_Attributes$keyPoints = _elm_lang$virtual_dom$VirtualDom$attribute('keyPoints');
var _elm_lang$svg$Svg_Attributes$kernelUnitLength = _elm_lang$virtual_dom$VirtualDom$attribute('kernelUnitLength');
var _elm_lang$svg$Svg_Attributes$kernelMatrix = _elm_lang$virtual_dom$VirtualDom$attribute('kernelMatrix');
var _elm_lang$svg$Svg_Attributes$k4 = _elm_lang$virtual_dom$VirtualDom$attribute('k4');
var _elm_lang$svg$Svg_Attributes$k3 = _elm_lang$virtual_dom$VirtualDom$attribute('k3');
var _elm_lang$svg$Svg_Attributes$k2 = _elm_lang$virtual_dom$VirtualDom$attribute('k2');
var _elm_lang$svg$Svg_Attributes$k1 = _elm_lang$virtual_dom$VirtualDom$attribute('k1');
var _elm_lang$svg$Svg_Attributes$k = _elm_lang$virtual_dom$VirtualDom$attribute('k');
var _elm_lang$svg$Svg_Attributes$intercept = _elm_lang$virtual_dom$VirtualDom$attribute('intercept');
var _elm_lang$svg$Svg_Attributes$in2 = _elm_lang$virtual_dom$VirtualDom$attribute('in2');
var _elm_lang$svg$Svg_Attributes$in_ = _elm_lang$virtual_dom$VirtualDom$attribute('in');
var _elm_lang$svg$Svg_Attributes$ideographic = _elm_lang$virtual_dom$VirtualDom$attribute('ideographic');
var _elm_lang$svg$Svg_Attributes$id = _elm_lang$virtual_dom$VirtualDom$attribute('id');
var _elm_lang$svg$Svg_Attributes$horizOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-y');
var _elm_lang$svg$Svg_Attributes$horizOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-x');
var _elm_lang$svg$Svg_Attributes$horizAdvX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-adv-x');
var _elm_lang$svg$Svg_Attributes$height = _elm_lang$virtual_dom$VirtualDom$attribute('height');
var _elm_lang$svg$Svg_Attributes$hanging = _elm_lang$virtual_dom$VirtualDom$attribute('hanging');
var _elm_lang$svg$Svg_Attributes$gradientUnits = _elm_lang$virtual_dom$VirtualDom$attribute('gradientUnits');
var _elm_lang$svg$Svg_Attributes$gradientTransform = _elm_lang$virtual_dom$VirtualDom$attribute('gradientTransform');
var _elm_lang$svg$Svg_Attributes$glyphRef = _elm_lang$virtual_dom$VirtualDom$attribute('glyphRef');
var _elm_lang$svg$Svg_Attributes$glyphName = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-name');
var _elm_lang$svg$Svg_Attributes$g2 = _elm_lang$virtual_dom$VirtualDom$attribute('g2');
var _elm_lang$svg$Svg_Attributes$g1 = _elm_lang$virtual_dom$VirtualDom$attribute('g1');
var _elm_lang$svg$Svg_Attributes$fy = _elm_lang$virtual_dom$VirtualDom$attribute('fy');
var _elm_lang$svg$Svg_Attributes$fx = _elm_lang$virtual_dom$VirtualDom$attribute('fx');
var _elm_lang$svg$Svg_Attributes$from = _elm_lang$virtual_dom$VirtualDom$attribute('from');
var _elm_lang$svg$Svg_Attributes$format = _elm_lang$virtual_dom$VirtualDom$attribute('format');
var _elm_lang$svg$Svg_Attributes$filterUnits = _elm_lang$virtual_dom$VirtualDom$attribute('filterUnits');
var _elm_lang$svg$Svg_Attributes$filterRes = _elm_lang$virtual_dom$VirtualDom$attribute('filterRes');
var _elm_lang$svg$Svg_Attributes$externalResourcesRequired = _elm_lang$virtual_dom$VirtualDom$attribute('externalResourcesRequired');
var _elm_lang$svg$Svg_Attributes$exponent = _elm_lang$virtual_dom$VirtualDom$attribute('exponent');
var _elm_lang$svg$Svg_Attributes$end = _elm_lang$virtual_dom$VirtualDom$attribute('end');
var _elm_lang$svg$Svg_Attributes$elevation = _elm_lang$virtual_dom$VirtualDom$attribute('elevation');
var _elm_lang$svg$Svg_Attributes$edgeMode = _elm_lang$virtual_dom$VirtualDom$attribute('edgeMode');
var _elm_lang$svg$Svg_Attributes$dy = _elm_lang$virtual_dom$VirtualDom$attribute('dy');
var _elm_lang$svg$Svg_Attributes$dx = _elm_lang$virtual_dom$VirtualDom$attribute('dx');
var _elm_lang$svg$Svg_Attributes$dur = _elm_lang$virtual_dom$VirtualDom$attribute('dur');
var _elm_lang$svg$Svg_Attributes$divisor = _elm_lang$virtual_dom$VirtualDom$attribute('divisor');
var _elm_lang$svg$Svg_Attributes$diffuseConstant = _elm_lang$virtual_dom$VirtualDom$attribute('diffuseConstant');
var _elm_lang$svg$Svg_Attributes$descent = _elm_lang$virtual_dom$VirtualDom$attribute('descent');
var _elm_lang$svg$Svg_Attributes$decelerate = _elm_lang$virtual_dom$VirtualDom$attribute('decelerate');
var _elm_lang$svg$Svg_Attributes$d = _elm_lang$virtual_dom$VirtualDom$attribute('d');
var _elm_lang$svg$Svg_Attributes$cy = _elm_lang$virtual_dom$VirtualDom$attribute('cy');
var _elm_lang$svg$Svg_Attributes$cx = _elm_lang$virtual_dom$VirtualDom$attribute('cx');
var _elm_lang$svg$Svg_Attributes$contentStyleType = _elm_lang$virtual_dom$VirtualDom$attribute('contentStyleType');
var _elm_lang$svg$Svg_Attributes$contentScriptType = _elm_lang$virtual_dom$VirtualDom$attribute('contentScriptType');
var _elm_lang$svg$Svg_Attributes$clipPathUnits = _elm_lang$virtual_dom$VirtualDom$attribute('clipPathUnits');
var _elm_lang$svg$Svg_Attributes$class = _elm_lang$virtual_dom$VirtualDom$attribute('class');
var _elm_lang$svg$Svg_Attributes$capHeight = _elm_lang$virtual_dom$VirtualDom$attribute('cap-height');
var _elm_lang$svg$Svg_Attributes$calcMode = _elm_lang$virtual_dom$VirtualDom$attribute('calcMode');
var _elm_lang$svg$Svg_Attributes$by = _elm_lang$virtual_dom$VirtualDom$attribute('by');
var _elm_lang$svg$Svg_Attributes$bias = _elm_lang$virtual_dom$VirtualDom$attribute('bias');
var _elm_lang$svg$Svg_Attributes$begin = _elm_lang$virtual_dom$VirtualDom$attribute('begin');
var _elm_lang$svg$Svg_Attributes$bbox = _elm_lang$virtual_dom$VirtualDom$attribute('bbox');
var _elm_lang$svg$Svg_Attributes$baseProfile = _elm_lang$virtual_dom$VirtualDom$attribute('baseProfile');
var _elm_lang$svg$Svg_Attributes$baseFrequency = _elm_lang$virtual_dom$VirtualDom$attribute('baseFrequency');
var _elm_lang$svg$Svg_Attributes$azimuth = _elm_lang$virtual_dom$VirtualDom$attribute('azimuth');
var _elm_lang$svg$Svg_Attributes$autoReverse = _elm_lang$virtual_dom$VirtualDom$attribute('autoReverse');
var _elm_lang$svg$Svg_Attributes$attributeType = _elm_lang$virtual_dom$VirtualDom$attribute('attributeType');
var _elm_lang$svg$Svg_Attributes$attributeName = _elm_lang$virtual_dom$VirtualDom$attribute('attributeName');
var _elm_lang$svg$Svg_Attributes$ascent = _elm_lang$virtual_dom$VirtualDom$attribute('ascent');
var _elm_lang$svg$Svg_Attributes$arabicForm = _elm_lang$virtual_dom$VirtualDom$attribute('arabic-form');
var _elm_lang$svg$Svg_Attributes$amplitude = _elm_lang$virtual_dom$VirtualDom$attribute('amplitude');
var _elm_lang$svg$Svg_Attributes$allowReorder = _elm_lang$virtual_dom$VirtualDom$attribute('allowReorder');
var _elm_lang$svg$Svg_Attributes$alphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('alphabetic');
var _elm_lang$svg$Svg_Attributes$additive = _elm_lang$virtual_dom$VirtualDom$attribute('additive');
var _elm_lang$svg$Svg_Attributes$accumulate = _elm_lang$virtual_dom$VirtualDom$attribute('accumulate');
var _elm_lang$svg$Svg_Attributes$accelerate = _elm_lang$virtual_dom$VirtualDom$attribute('accelerate');
var _elm_lang$svg$Svg_Attributes$accentHeight = _elm_lang$virtual_dom$VirtualDom$attribute('accent-height');

var _elm_lang$svg$Svg_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$svg$Svg_Events$simpleOn = F2(
	function (name, msg) {
		return A2(
			_elm_lang$svg$Svg_Events$on,
			name,
			_elm_lang$core$Json_Decode$succeed(msg));
	});
var _elm_lang$svg$Svg_Events$onBegin = _elm_lang$svg$Svg_Events$simpleOn('begin');
var _elm_lang$svg$Svg_Events$onEnd = _elm_lang$svg$Svg_Events$simpleOn('end');
var _elm_lang$svg$Svg_Events$onRepeat = _elm_lang$svg$Svg_Events$simpleOn('repeat');
var _elm_lang$svg$Svg_Events$onAbort = _elm_lang$svg$Svg_Events$simpleOn('abort');
var _elm_lang$svg$Svg_Events$onError = _elm_lang$svg$Svg_Events$simpleOn('error');
var _elm_lang$svg$Svg_Events$onResize = _elm_lang$svg$Svg_Events$simpleOn('resize');
var _elm_lang$svg$Svg_Events$onScroll = _elm_lang$svg$Svg_Events$simpleOn('scroll');
var _elm_lang$svg$Svg_Events$onLoad = _elm_lang$svg$Svg_Events$simpleOn('load');
var _elm_lang$svg$Svg_Events$onUnload = _elm_lang$svg$Svg_Events$simpleOn('unload');
var _elm_lang$svg$Svg_Events$onZoom = _elm_lang$svg$Svg_Events$simpleOn('zoom');
var _elm_lang$svg$Svg_Events$onActivate = _elm_lang$svg$Svg_Events$simpleOn('activate');
var _elm_lang$svg$Svg_Events$onClick = _elm_lang$svg$Svg_Events$simpleOn('click');
var _elm_lang$svg$Svg_Events$onFocusIn = _elm_lang$svg$Svg_Events$simpleOn('focusin');
var _elm_lang$svg$Svg_Events$onFocusOut = _elm_lang$svg$Svg_Events$simpleOn('focusout');
var _elm_lang$svg$Svg_Events$onMouseDown = _elm_lang$svg$Svg_Events$simpleOn('mousedown');
var _elm_lang$svg$Svg_Events$onMouseMove = _elm_lang$svg$Svg_Events$simpleOn('mousemove');
var _elm_lang$svg$Svg_Events$onMouseOut = _elm_lang$svg$Svg_Events$simpleOn('mouseout');
var _elm_lang$svg$Svg_Events$onMouseOver = _elm_lang$svg$Svg_Events$simpleOn('mouseover');
var _elm_lang$svg$Svg_Events$onMouseUp = _elm_lang$svg$Svg_Events$simpleOn('mouseup');

var _elm_lang$window$Native_Window = function()
{

var size = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)	{
	callback(_elm_lang$core$Native_Scheduler.succeed({
		width: window.innerWidth,
		height: window.innerHeight
	}));
});

return {
	size: size
};

}();
var _elm_lang$window$Window_ops = _elm_lang$window$Window_ops || {};
_elm_lang$window$Window_ops['&>'] = F2(
	function (task1, task2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return task2;
			},
			task1);
	});
var _elm_lang$window$Window$onSelfMsg = F3(
	function (router, dimensions, state) {
		var _p1 = state;
		if (_p1.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var send = function (_p2) {
				var _p3 = _p2;
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					_p3._0(dimensions));
			};
			return A2(
				_elm_lang$window$Window_ops['&>'],
				_elm_lang$core$Task$sequence(
					A2(_elm_lang$core$List$map, send, _p1._0.subs)),
				_elm_lang$core$Task$succeed(state));
		}
	});
var _elm_lang$window$Window$init = _elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing);
var _elm_lang$window$Window$size = _elm_lang$window$Native_Window.size;
var _elm_lang$window$Window$width = A2(
	_elm_lang$core$Task$map,
	function (_) {
		return _.width;
	},
	_elm_lang$window$Window$size);
var _elm_lang$window$Window$height = A2(
	_elm_lang$core$Task$map,
	function (_) {
		return _.height;
	},
	_elm_lang$window$Window$size);
var _elm_lang$window$Window$onEffects = F3(
	function (router, newSubs, oldState) {
		var _p4 = {ctor: '_Tuple2', _0: oldState, _1: newSubs};
		if (_p4._0.ctor === 'Nothing') {
			if (_p4._1.ctor === '[]') {
				return _elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing);
			} else {
				return A2(
					_elm_lang$core$Task$andThen,
					function (pid) {
						return _elm_lang$core$Task$succeed(
							_elm_lang$core$Maybe$Just(
								{subs: newSubs, pid: pid}));
					},
					_elm_lang$core$Process$spawn(
						A3(
							_elm_lang$dom$Dom_LowLevel$onWindow,
							'resize',
							_elm_lang$core$Json_Decode$succeed(
								{ctor: '_Tuple0'}),
							function (_p5) {
								return A2(
									_elm_lang$core$Task$andThen,
									_elm_lang$core$Platform$sendToSelf(router),
									_elm_lang$window$Window$size);
							})));
			}
		} else {
			if (_p4._1.ctor === '[]') {
				return A2(
					_elm_lang$window$Window_ops['&>'],
					_elm_lang$core$Process$kill(_p4._0._0.pid),
					_elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing));
			} else {
				return _elm_lang$core$Task$succeed(
					_elm_lang$core$Maybe$Just(
						{subs: newSubs, pid: _p4._0._0.pid}));
			}
		}
	});
var _elm_lang$window$Window$subscription = _elm_lang$core$Native_Platform.leaf('Window');
var _elm_lang$window$Window$Size = F2(
	function (a, b) {
		return {width: a, height: b};
	});
var _elm_lang$window$Window$MySub = function (a) {
	return {ctor: 'MySub', _0: a};
};
var _elm_lang$window$Window$resizes = function (tagger) {
	return _elm_lang$window$Window$subscription(
		_elm_lang$window$Window$MySub(tagger));
};
var _elm_lang$window$Window$subMap = F2(
	function (func, _p6) {
		var _p7 = _p6;
		return _elm_lang$window$Window$MySub(
			function (_p8) {
				return func(
					_p7._0(_p8));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Window'] = {pkg: 'elm-lang/window', init: _elm_lang$window$Window$init, onEffects: _elm_lang$window$Window$onEffects, onSelfMsg: _elm_lang$window$Window$onSelfMsg, tag: 'sub', subMap: _elm_lang$window$Window$subMap};

var _folkertdev$elm_deque$Internal$rebalance = function (_p0) {
	var _p1 = _p0;
	var _p6 = _p1.sizeR;
	var _p5 = _p1.sizeF;
	var _p4 = _p1.rear;
	var _p3 = _p1.front;
	var _p2 = _p1;
	var size1 = ((_p5 + _p6) / 2) | 0;
	var size2 = (_p5 + _p6) - size1;
	var balanceConstant = 4;
	if (_elm_lang$core$Native_Utils.cmp(_p5 + _p6, 2) < 0) {
		return _p2;
	} else {
		if (_elm_lang$core$Native_Utils.cmp(_p5, (balanceConstant * _p6) + 1) > 0) {
			var newRear = A2(
				_elm_lang$core$Basics_ops['++'],
				_p4,
				_elm_lang$core$List$reverse(
					A2(_elm_lang$core$List$drop, size1, _p3)));
			var newFront = A2(_elm_lang$core$List$take, size1, _p3);
			return _elm_lang$core$Native_Utils.update(
				_p2,
				{sizeF: size1, front: newFront, rear: newRear, sizeR: size2});
		} else {
			if (_elm_lang$core$Native_Utils.cmp(_p6, (balanceConstant * _p5) + 1) > 0) {
				var newRear = A2(_elm_lang$core$List$take, size1, _p4);
				var newFront = A2(
					_elm_lang$core$Basics_ops['++'],
					_p3,
					_elm_lang$core$List$reverse(
						A2(_elm_lang$core$List$drop, size1, _p4)));
				return _elm_lang$core$Native_Utils.update(
					_p2,
					{sizeF: size1, front: newFront, rear: newRear, sizeR: size2});
			} else {
				return _p2;
			}
		}
	}
};
var _folkertdev$elm_deque$Internal$fromList = F2(
	function (empty, list) {
		return _folkertdev$elm_deque$Internal$rebalance(
			_elm_lang$core$Native_Utils.update(
				empty,
				{
					sizeF: _elm_lang$core$List$length(list),
					front: list
				}));
	});
var _folkertdev$elm_deque$Internal$toList = function (deque) {
	return A2(
		_elm_lang$core$Basics_ops['++'],
		deque.front,
		_elm_lang$core$List$reverse(deque.rear));
};
var _folkertdev$elm_deque$Internal$foldr = F3(
	function (f, initial, deque) {
		return function (initial_) {
			return A3(_elm_lang$core$List$foldr, f, initial_, deque.front);
		}(
			A3(_elm_lang$core$List$foldl, f, initial, deque.rear));
	});
var _folkertdev$elm_deque$Internal$foldl = F3(
	function (f, initial, deque) {
		return function (initial_) {
			return A3(_elm_lang$core$List$foldr, f, initial_, deque.rear);
		}(
			A3(_elm_lang$core$List$foldl, f, initial, deque.front));
	});
var _folkertdev$elm_deque$Internal$filter = F2(
	function (p, deque) {
		var newRear = A2(_elm_lang$core$List$filter, p, deque.rear);
		var newFront = A2(_elm_lang$core$List$filter, p, deque.front);
		return _folkertdev$elm_deque$Internal$rebalance(
			_elm_lang$core$Native_Utils.update(
				deque,
				{
					sizeF: _elm_lang$core$List$length(newFront),
					front: newFront,
					sizeR: _elm_lang$core$List$length(newRear),
					rear: newRear
				}));
	});
var _folkertdev$elm_deque$Internal$map = F2(
	function (f, deque) {
		return _elm_lang$core$Native_Utils.update(
			deque,
			{
				front: A2(_elm_lang$core$List$map, f, deque.front),
				rear: A2(_elm_lang$core$List$map, f, deque.rear)
			});
	});
var _folkertdev$elm_deque$Internal$length = function (deque) {
	return deque.sizeF + deque.sizeR;
};
var _folkertdev$elm_deque$Internal$member = F2(
	function (elem, deque) {
		return A2(_elm_lang$core$List$member, elem, deque.front) || A2(_elm_lang$core$List$member, elem, deque.rear);
	});
var _folkertdev$elm_deque$Internal$isEmpty = function (deque) {
	return _elm_lang$core$Native_Utils.eq(
		_folkertdev$elm_deque$Internal$length(deque),
		0);
};
var _folkertdev$elm_deque$Internal$takeBack = F2(
	function (i, deque) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			A2(_elm_lang$core$List$take, i, deque.rear),
			A2(
				_elm_lang$core$List$take,
				i - deque.sizeR,
				_elm_lang$core$List$reverse(deque.front)));
	});
var _folkertdev$elm_deque$Internal$takeFront = F2(
	function (i, deque) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			A2(_elm_lang$core$List$take, i, deque.front),
			A2(
				_elm_lang$core$List$take,
				i - deque.sizeF,
				_elm_lang$core$List$reverse(deque.rear)));
	});
var _folkertdev$elm_deque$Internal$popBack = F2(
	function (empty, _p7) {
		var _p8 = _p7;
		var _p11 = _p8;
		var _p9 = {ctor: '_Tuple2', _0: _p8.front, _1: _p8.rear};
		if (_p9._1.ctor === '[]') {
			if (_p9._0.ctor === '[]') {
				return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: empty};
			} else {
				if (_p9._0._1.ctor === '[]') {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(_p9._0._0),
						_1: empty
					};
				} else {
					return _elm_lang$core$Native_Utils.crashCase(
						'Internal',
						{
							start: {line: 75, column: 5},
							end: {line: 89, column: 14}
						},
						_p9)('AbstractDeque record is too far unbalanced');
				}
			}
		} else {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Just(_p9._1._0),
				_1: _folkertdev$elm_deque$Internal$rebalance(
					_elm_lang$core$Native_Utils.update(
						_p11,
						{sizeR: _p11.sizeR - 1, rear: _p9._1._1}))
			};
		}
	});
var _folkertdev$elm_deque$Internal$popFront = F2(
	function (empty, _p12) {
		var _p13 = _p12;
		var _p16 = _p13;
		var _p14 = {ctor: '_Tuple2', _0: _p13.front, _1: _p13.rear};
		if (_p14._0.ctor === '[]') {
			if (_p14._1.ctor === '[]') {
				return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: empty};
			} else {
				if (_p14._1._1.ctor === '[]') {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(_p14._1._0),
						_1: empty
					};
				} else {
					return _elm_lang$core$Native_Utils.crashCase(
						'Internal',
						{
							start: {line: 53, column: 5},
							end: {line: 67, column: 14}
						},
						_p14)('AbstractDeque record is too far unbalanced');
				}
			}
		} else {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Just(_p14._0._0),
				_1: _folkertdev$elm_deque$Internal$rebalance(
					_elm_lang$core$Native_Utils.update(
						_p16,
						{sizeF: _p16.sizeF - 1, front: _p14._0._1}))
			};
		}
	});
var _folkertdev$elm_deque$Internal$last = function (deque) {
	var _p17 = {ctor: '_Tuple2', _0: deque.front, _1: deque.rear};
	if ((((_p17.ctor === '_Tuple2') && (_p17._0.ctor === '::')) && (_p17._0._1.ctor === '[]')) && (_p17._1.ctor === '[]')) {
		return _elm_lang$core$Maybe$Just(_p17._0._0);
	} else {
		return _elm_lang$core$List$head(deque.rear);
	}
};
var _folkertdev$elm_deque$Internal$first = function (deque) {
	var _p18 = {ctor: '_Tuple2', _0: deque.front, _1: deque.rear};
	if ((((_p18.ctor === '_Tuple2') && (_p18._0.ctor === '[]')) && (_p18._1.ctor === '::')) && (_p18._1._1.ctor === '[]')) {
		return _elm_lang$core$Maybe$Just(_p18._1._0);
	} else {
		return _elm_lang$core$List$head(deque.front);
	}
};
var _folkertdev$elm_deque$Internal$Deque = function (a) {
	return {ctor: 'Deque', _0: a};
};

var _folkertdev$elm_deque$Deque$emptyAbstract = {
	sizeF: 0,
	front: {ctor: '[]'},
	sizeR: 0,
	rear: {ctor: '[]'}
};
var _folkertdev$elm_deque$Deque$fromList = function (_p0) {
	return _folkertdev$elm_deque$Internal$Deque(
		A2(_folkertdev$elm_deque$Internal$fromList, _folkertdev$elm_deque$Deque$emptyAbstract, _p0));
};
var _folkertdev$elm_deque$Deque$partition = F2(
	function (p, _p1) {
		var _p2 = _p1;
		var _p5 = _p2._0;
		var _p3 = A2(_elm_lang$core$List$partition, p, _p5.rear);
		var l2 = _p3._0;
		var r2 = _p3._1;
		var _p4 = A2(_elm_lang$core$List$partition, p, _p5.front);
		var l1 = _p4._0;
		var r1 = _p4._1;
		return {
			ctor: '_Tuple2',
			_0: _folkertdev$elm_deque$Deque$fromList(
				A2(_elm_lang$core$Basics_ops['++'], l1, l2)),
			_1: _folkertdev$elm_deque$Deque$fromList(
				A2(_elm_lang$core$Basics_ops['++'], r1, r2))
		};
	});
var _folkertdev$elm_deque$Deque$empty = _folkertdev$elm_deque$Internal$Deque(_folkertdev$elm_deque$Deque$emptyAbstract);
var _folkertdev$elm_deque$Deque$unwrap = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};
var _folkertdev$elm_deque$Deque$popFront = function (_p8) {
	return A2(
		_elm_lang$core$Tuple$mapSecond,
		_folkertdev$elm_deque$Internal$Deque,
		A2(
			_folkertdev$elm_deque$Internal$popFront,
			_folkertdev$elm_deque$Deque$emptyAbstract,
			_folkertdev$elm_deque$Deque$unwrap(_p8)));
};
var _folkertdev$elm_deque$Deque$popBack = function (_p9) {
	return A2(
		_elm_lang$core$Tuple$mapSecond,
		_folkertdev$elm_deque$Internal$Deque,
		A2(
			_folkertdev$elm_deque$Internal$popBack,
			_folkertdev$elm_deque$Deque$emptyAbstract,
			_folkertdev$elm_deque$Deque$unwrap(_p9)));
};
var _folkertdev$elm_deque$Deque$isEmpty = function (_p10) {
	return _folkertdev$elm_deque$Internal$isEmpty(
		_folkertdev$elm_deque$Deque$unwrap(_p10));
};
var _folkertdev$elm_deque$Deque$append = F2(
	function (_p12, _p11) {
		var _p13 = _p12;
		var _p18 = _p13._0;
		var _p17 = _p13;
		var _p14 = _p11;
		var _p16 = _p14._0;
		var _p15 = _p14;
		return _folkertdev$elm_deque$Deque$isEmpty(_p17) ? _p15 : (_folkertdev$elm_deque$Deque$isEmpty(_p15) ? _p17 : _folkertdev$elm_deque$Internal$Deque(
			{
				sizeF: _p18.sizeF + _p18.sizeR,
				front: A2(
					_elm_lang$core$Basics_ops['++'],
					_p18.front,
					_elm_lang$core$List$reverse(_p18.rear)),
				sizeR: _p16.sizeF + _p16.sizeR,
				rear: _elm_lang$core$List$reverse(
					A2(
						_elm_lang$core$Basics_ops['++'],
						_p16.front,
						_elm_lang$core$List$reverse(_p16.rear)))
			}));
	});
var _folkertdev$elm_deque$Deque$member = function (elem) {
	return function (_p19) {
		return A2(
			_folkertdev$elm_deque$Internal$member,
			elem,
			_folkertdev$elm_deque$Deque$unwrap(_p19));
	};
};
var _folkertdev$elm_deque$Deque$length = function (_p20) {
	return _folkertdev$elm_deque$Internal$length(
		_folkertdev$elm_deque$Deque$unwrap(_p20));
};
var _folkertdev$elm_deque$Deque$foldl = F2(
	function (f, initial) {
		return function (_p21) {
			return A3(
				_folkertdev$elm_deque$Internal$foldl,
				f,
				initial,
				_folkertdev$elm_deque$Deque$unwrap(_p21));
		};
	});
var _folkertdev$elm_deque$Deque$foldr = F2(
	function (f, initial) {
		return function (_p22) {
			return A3(
				_folkertdev$elm_deque$Internal$foldr,
				f,
				initial,
				_folkertdev$elm_deque$Deque$unwrap(_p22));
		};
	});
var _folkertdev$elm_deque$Deque$first = function (_p23) {
	return _folkertdev$elm_deque$Internal$first(
		_folkertdev$elm_deque$Deque$unwrap(_p23));
};
var _folkertdev$elm_deque$Deque$last = function (_p24) {
	return _folkertdev$elm_deque$Internal$last(
		_folkertdev$elm_deque$Deque$unwrap(_p24));
};
var _folkertdev$elm_deque$Deque$takeFront = function (i) {
	return function (_p25) {
		return A2(
			_folkertdev$elm_deque$Internal$takeFront,
			i,
			_folkertdev$elm_deque$Deque$unwrap(_p25));
	};
};
var _folkertdev$elm_deque$Deque$takeBack = function (i) {
	return function (_p26) {
		return A2(
			_folkertdev$elm_deque$Internal$takeBack,
			i,
			_folkertdev$elm_deque$Deque$unwrap(_p26));
	};
};
var _folkertdev$elm_deque$Deque$toList = function (_p27) {
	return _folkertdev$elm_deque$Internal$toList(
		_folkertdev$elm_deque$Deque$unwrap(_p27));
};
var _folkertdev$elm_deque$Deque$map2 = F3(
	function (f, a, b) {
		return _folkertdev$elm_deque$Deque$fromList(
			A3(
				_elm_lang$core$List$map2,
				f,
				_folkertdev$elm_deque$Deque$toList(a),
				_folkertdev$elm_deque$Deque$toList(b)));
	});
var _folkertdev$elm_deque$Deque$andMap = _folkertdev$elm_deque$Deque$map2(
	F2(
		function (x, y) {
			return y(x);
		}));
var _folkertdev$elm_deque$Deque$mapAbstract = F2(
	function (f, _p28) {
		var _p29 = _p28;
		return _folkertdev$elm_deque$Internal$Deque(
			f(_p29._0));
	});
var _folkertdev$elm_deque$Deque$pushFront = F2(
	function (elem, _p30) {
		var _p31 = _p30;
		var _p32 = _p31._0;
		return A2(
			_folkertdev$elm_deque$Deque$mapAbstract,
			_folkertdev$elm_deque$Internal$rebalance,
			_folkertdev$elm_deque$Internal$Deque(
				_elm_lang$core$Native_Utils.update(
					_p32,
					{
						sizeF: _p32.sizeF + 1,
						front: {ctor: '::', _0: elem, _1: _p32.front}
					})));
	});
var _folkertdev$elm_deque$Deque$singleton = function (elem) {
	return A2(_folkertdev$elm_deque$Deque$pushFront, elem, _folkertdev$elm_deque$Deque$empty);
};
var _folkertdev$elm_deque$Deque$pushBack = F2(
	function (elem, _p33) {
		var _p34 = _p33;
		var _p35 = _p34._0;
		return A2(
			_folkertdev$elm_deque$Deque$mapAbstract,
			_folkertdev$elm_deque$Internal$rebalance,
			_folkertdev$elm_deque$Internal$Deque(
				_elm_lang$core$Native_Utils.update(
					_p35,
					{
						sizeR: _p35.sizeR + 1,
						rear: {ctor: '::', _0: elem, _1: _p35.rear}
					})));
	});
var _folkertdev$elm_deque$Deque$map = function (f) {
	return _folkertdev$elm_deque$Deque$mapAbstract(
		_folkertdev$elm_deque$Internal$map(f));
};
var _folkertdev$elm_deque$Deque$filter = function (p) {
	return _folkertdev$elm_deque$Deque$mapAbstract(
		_folkertdev$elm_deque$Internal$filter(p));
};

var _folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCoordinate = function (_p0) {
	var _p1 = _p0;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_elm_lang$core$Basics$toString(_p1._0),
		A2(
			_elm_lang$core$Basics_ops['++'],
			',',
			_elm_lang$core$Basics$toString(_p1._1)));
};
var _folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCoordinate2 = function (_p2) {
	var _p3 = _p2;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCoordinate(_p3._0),
		A2(
			_elm_lang$core$Basics_ops['++'],
			' ',
			_folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCoordinate(_p3._1)));
};
var _folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCoordinate3 = function (_p4) {
	var _p5 = _p4;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCoordinate(_p5._0),
		A2(
			_elm_lang$core$Basics_ops['++'],
			' ',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCoordinate(_p5._1),
				A2(
					_elm_lang$core$Basics_ops['++'],
					' ',
					_folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCoordinate(_p5._2)))));
};
var _folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCharacter = F2(
	function (mode, character) {
		var _p6 = mode;
		if (_p6.ctor === 'Absolute') {
			return _elm_lang$core$String$fromChar(
				_elm_lang$core$Char$toUpper(character));
		} else {
			return _elm_lang$core$String$fromChar(
				_elm_lang$core$Char$toLower(character));
		}
	});
var _folkertdev$svg_path_lowlevel$Path_LowLevel$isEmpty = function (command) {
	var _p7 = command;
	switch (_p7.ctor) {
		case 'LineTo':
			return _elm_lang$core$List$isEmpty(_p7._1);
		case 'Horizontal':
			return _elm_lang$core$List$isEmpty(_p7._1);
		case 'Vertical':
			return _elm_lang$core$List$isEmpty(_p7._1);
		case 'CurveTo':
			return _elm_lang$core$List$isEmpty(_p7._1);
		case 'SmoothCurveTo':
			return _elm_lang$core$List$isEmpty(_p7._1);
		case 'QuadraticBezierCurveTo':
			return _elm_lang$core$List$isEmpty(_p7._1);
		case 'SmoothQuadraticBezierCurveTo':
			return _elm_lang$core$List$isEmpty(_p7._1);
		case 'EllipticalArc':
			return _elm_lang$core$List$isEmpty(_p7._1);
		default:
			return false;
	}
};
var _folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyMoveTo = function (_p8) {
	var _p9 = _p8;
	var _p11 = _p9._1;
	var _p10 = _p9._0;
	if (_p10.ctor === 'Absolute') {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			'M',
			_folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCoordinate(_p11));
	} else {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			'm',
			_folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCoordinate(_p11));
	}
};
var _folkertdev$svg_path_lowlevel$Path_LowLevel$encodeFlags = function (_p12) {
	var _p13 = _p12;
	var _p14 = {ctor: '_Tuple2', _0: _p13._0, _1: _p13._1};
	if (_p14._0.ctor === 'LargestArc') {
		if (_p14._1.ctor === 'Clockwise') {
			return {ctor: '_Tuple2', _0: 1, _1: 0};
		} else {
			return {ctor: '_Tuple2', _0: 1, _1: 1};
		}
	} else {
		if (_p14._1.ctor === 'Clockwise') {
			return {ctor: '_Tuple2', _0: 0, _1: 0};
		} else {
			return {ctor: '_Tuple2', _0: 0, _1: 1};
		}
	}
};
var _folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyEllipticalArcArgument = function (_p15) {
	var _p16 = _p15;
	var _p17 = _folkertdev$svg_path_lowlevel$Path_LowLevel$encodeFlags(
		{ctor: '_Tuple2', _0: _p16.arcFlag, _1: _p16.direction});
	var arc = _p17._0;
	var sweep = _p17._1;
	return A2(
		_elm_lang$core$String$join,
		' ',
		{
			ctor: '::',
			_0: _folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCoordinate(_p16.radii),
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Basics$toString(_p16.xAxisRotate),
				_1: {
					ctor: '::',
					_0: _elm_lang$core$Basics$toString(arc),
					_1: {
						ctor: '::',
						_0: _elm_lang$core$Basics$toString(sweep),
						_1: {
							ctor: '::',
							_0: _folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCoordinate(_p16.target),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		});
};
var _folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyDrawTo = function (command) {
	if (_folkertdev$svg_path_lowlevel$Path_LowLevel$isEmpty(command)) {
		return '';
	} else {
		var _p18 = command;
		switch (_p18.ctor) {
			case 'LineTo':
				return A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCharacter,
						_p18._0,
						_elm_lang$core$Native_Utils.chr('L')),
					A2(
						_elm_lang$core$String$join,
						' ',
						A2(_elm_lang$core$List$map, _folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCoordinate, _p18._1)));
			case 'Horizontal':
				var _p19 = _p18._1;
				return _elm_lang$core$List$isEmpty(_p19) ? '' : A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCharacter,
						_p18._0,
						_elm_lang$core$Native_Utils.chr('H')),
					A2(
						_elm_lang$core$String$join,
						' ',
						A2(_elm_lang$core$List$map, _elm_lang$core$Basics$toString, _p19)));
			case 'Vertical':
				return A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCharacter,
						_p18._0,
						_elm_lang$core$Native_Utils.chr('V')),
					A2(
						_elm_lang$core$String$join,
						' ',
						A2(_elm_lang$core$List$map, _elm_lang$core$Basics$toString, _p18._1)));
			case 'CurveTo':
				return A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCharacter,
						_p18._0,
						_elm_lang$core$Native_Utils.chr('C')),
					A2(
						_elm_lang$core$String$join,
						' ',
						A2(_elm_lang$core$List$map, _folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCoordinate3, _p18._1)));
			case 'SmoothCurveTo':
				return A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCharacter,
						_p18._0,
						_elm_lang$core$Native_Utils.chr('S')),
					A2(
						_elm_lang$core$String$join,
						' ',
						A2(_elm_lang$core$List$map, _folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCoordinate2, _p18._1)));
			case 'QuadraticBezierCurveTo':
				return A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCharacter,
						_p18._0,
						_elm_lang$core$Native_Utils.chr('Q')),
					A2(
						_elm_lang$core$String$join,
						' ',
						A2(_elm_lang$core$List$map, _folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCoordinate2, _p18._1)));
			case 'SmoothQuadraticBezierCurveTo':
				return A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCharacter,
						_p18._0,
						_elm_lang$core$Native_Utils.chr('T')),
					A2(
						_elm_lang$core$String$join,
						' ',
						A2(_elm_lang$core$List$map, _folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCoordinate, _p18._1)));
			case 'EllipticalArc':
				return A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyCharacter,
						_p18._0,
						_elm_lang$core$Native_Utils.chr('A')),
					A2(
						_elm_lang$core$String$join,
						' ',
						A2(_elm_lang$core$List$map, _folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyEllipticalArcArgument, _p18._1)));
			default:
				return 'Z';
		}
	}
};
var _folkertdev$svg_path_lowlevel$Path_LowLevel$toStringSubPath = function (_p20) {
	var _p21 = _p20;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyMoveTo(_p21.moveto),
		A2(
			_elm_lang$core$Basics_ops['++'],
			' ',
			A2(
				_elm_lang$core$String$join,
				' ',
				A2(_elm_lang$core$List$map, _folkertdev$svg_path_lowlevel$Path_LowLevel$stringifyDrawTo, _p21.drawtos))));
};
var _folkertdev$svg_path_lowlevel$Path_LowLevel$toString = function (subpaths) {
	return A2(
		_elm_lang$core$String$join,
		' ',
		A2(_elm_lang$core$List$map, _folkertdev$svg_path_lowlevel$Path_LowLevel$toStringSubPath, subpaths));
};
var _folkertdev$svg_path_lowlevel$Path_LowLevel$element = F2(
	function (attributes, subpaths) {
		return A2(
			_elm_lang$svg$Svg$path,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$d(
					_folkertdev$svg_path_lowlevel$Path_LowLevel$toString(subpaths)),
				_1: attributes
			},
			{ctor: '[]'});
	});
var _folkertdev$svg_path_lowlevel$Path_LowLevel$SubPath = F2(
	function (a, b) {
		return {moveto: a, drawtos: b};
	});
var _folkertdev$svg_path_lowlevel$Path_LowLevel$EllipticalArcArgument = F5(
	function (a, b, c, d, e) {
		return {radii: a, xAxisRotate: b, arcFlag: c, direction: d, target: e};
	});
var _folkertdev$svg_path_lowlevel$Path_LowLevel$Absolute = {ctor: 'Absolute'};
var _folkertdev$svg_path_lowlevel$Path_LowLevel$Relative = {ctor: 'Relative'};
var _folkertdev$svg_path_lowlevel$Path_LowLevel$MoveTo = F2(
	function (a, b) {
		return {ctor: 'MoveTo', _0: a, _1: b};
	});
var _folkertdev$svg_path_lowlevel$Path_LowLevel$ClosePath = {ctor: 'ClosePath'};
var _folkertdev$svg_path_lowlevel$Path_LowLevel$EllipticalArc = F2(
	function (a, b) {
		return {ctor: 'EllipticalArc', _0: a, _1: b};
	});
var _folkertdev$svg_path_lowlevel$Path_LowLevel$SmoothQuadraticBezierCurveTo = F2(
	function (a, b) {
		return {ctor: 'SmoothQuadraticBezierCurveTo', _0: a, _1: b};
	});
var _folkertdev$svg_path_lowlevel$Path_LowLevel$QuadraticBezierCurveTo = F2(
	function (a, b) {
		return {ctor: 'QuadraticBezierCurveTo', _0: a, _1: b};
	});
var _folkertdev$svg_path_lowlevel$Path_LowLevel$SmoothCurveTo = F2(
	function (a, b) {
		return {ctor: 'SmoothCurveTo', _0: a, _1: b};
	});
var _folkertdev$svg_path_lowlevel$Path_LowLevel$CurveTo = F2(
	function (a, b) {
		return {ctor: 'CurveTo', _0: a, _1: b};
	});
var _folkertdev$svg_path_lowlevel$Path_LowLevel$Vertical = F2(
	function (a, b) {
		return {ctor: 'Vertical', _0: a, _1: b};
	});
var _folkertdev$svg_path_lowlevel$Path_LowLevel$Horizontal = F2(
	function (a, b) {
		return {ctor: 'Horizontal', _0: a, _1: b};
	});
var _folkertdev$svg_path_lowlevel$Path_LowLevel$LineTo = F2(
	function (a, b) {
		return {ctor: 'LineTo', _0: a, _1: b};
	});
var _folkertdev$svg_path_lowlevel$Path_LowLevel$LargestArc = {ctor: 'LargestArc'};
var _folkertdev$svg_path_lowlevel$Path_LowLevel$largestArc = _folkertdev$svg_path_lowlevel$Path_LowLevel$LargestArc;
var _folkertdev$svg_path_lowlevel$Path_LowLevel$SmallestArc = {ctor: 'SmallestArc'};
var _folkertdev$svg_path_lowlevel$Path_LowLevel$smallestArc = _folkertdev$svg_path_lowlevel$Path_LowLevel$SmallestArc;
var _folkertdev$svg_path_lowlevel$Path_LowLevel$CounterClockwise = {ctor: 'CounterClockwise'};
var _folkertdev$svg_path_lowlevel$Path_LowLevel$counterClockwise = _folkertdev$svg_path_lowlevel$Path_LowLevel$CounterClockwise;
var _folkertdev$svg_path_lowlevel$Path_LowLevel$Clockwise = {ctor: 'Clockwise'};
var _folkertdev$svg_path_lowlevel$Path_LowLevel$clockwise = _folkertdev$svg_path_lowlevel$Path_LowLevel$Clockwise;
var _folkertdev$svg_path_lowlevel$Path_LowLevel$decodeFlags = function (_p22) {
	var _p23 = _p22;
	var _p24 = {ctor: '_Tuple2', _0: _p23._0, _1: _p23._1};
	_v13_4:
	do {
		if (_p24.ctor === '_Tuple2') {
			switch (_p24._0) {
				case 1:
					switch (_p24._1) {
						case 0:
							return _elm_lang$core$Maybe$Just(
								{ctor: '_Tuple2', _0: _folkertdev$svg_path_lowlevel$Path_LowLevel$LargestArc, _1: _folkertdev$svg_path_lowlevel$Path_LowLevel$Clockwise});
						case 1:
							return _elm_lang$core$Maybe$Just(
								{ctor: '_Tuple2', _0: _folkertdev$svg_path_lowlevel$Path_LowLevel$LargestArc, _1: _folkertdev$svg_path_lowlevel$Path_LowLevel$CounterClockwise});
						default:
							break _v13_4;
					}
				case 0:
					switch (_p24._1) {
						case 0:
							return _elm_lang$core$Maybe$Just(
								{ctor: '_Tuple2', _0: _folkertdev$svg_path_lowlevel$Path_LowLevel$SmallestArc, _1: _folkertdev$svg_path_lowlevel$Path_LowLevel$Clockwise});
						case 1:
							return _elm_lang$core$Maybe$Just(
								{ctor: '_Tuple2', _0: _folkertdev$svg_path_lowlevel$Path_LowLevel$SmallestArc, _1: _folkertdev$svg_path_lowlevel$Path_LowLevel$CounterClockwise});
						default:
							break _v13_4;
					}
				default:
					break _v13_4;
			}
		} else {
			break _v13_4;
		}
	} while(false);
	return _elm_lang$core$Maybe$Nothing;
};

var _folkertdev$one_true_path_experiment$LowLevel_Command$updateCursorState = F2(
	function (drawto, state) {
		var noControlPoint = function (state) {
			return _elm_lang$core$Native_Utils.update(
				state,
				{previousControlPoint: _elm_lang$core$Maybe$Nothing});
		};
		var maybeUpdateCursor = function (coordinate) {
			return _elm_lang$core$Native_Utils.update(
				state,
				{
					cursor: A2(_elm_lang$core$Maybe$withDefault, state.cursor, coordinate)
				});
		};
		var _p0 = state.cursor;
		var cursorX = _p0._0;
		var cursorY = _p0._1;
		var _p1 = drawto;
		switch (_p1.ctor) {
			case 'LineTo':
				return noControlPoint(
					maybeUpdateCursor(
						_elm_community$list_extra$List_Extra$last(_p1._0)));
			case 'Horizontal':
				return noControlPoint(
					maybeUpdateCursor(
						A2(
							_elm_lang$core$Maybe$map,
							function (x) {
								return {ctor: '_Tuple2', _0: x, _1: cursorY};
							},
							_elm_community$list_extra$List_Extra$last(_p1._0))));
			case 'Vertical':
				return noControlPoint(
					maybeUpdateCursor(
						A2(
							_elm_lang$core$Maybe$map,
							function (y) {
								return {ctor: '_Tuple2', _0: cursorX, _1: y};
							},
							_elm_community$list_extra$List_Extra$last(_p1._0))));
			case 'CurveTo':
				var _p2 = _elm_community$list_extra$List_Extra$last(_p1._0);
				if (_p2.ctor === 'Nothing') {
					return state;
				} else {
					return _elm_lang$core$Native_Utils.update(
						state,
						{
							cursor: _p2._0._2,
							previousControlPoint: _elm_lang$core$Maybe$Just(_p2._0._1)
						});
				}
			case 'QuadraticBezierCurveTo':
				var _p3 = _elm_community$list_extra$List_Extra$last(_p1._0);
				if (_p3.ctor === 'Nothing') {
					return state;
				} else {
					return _elm_lang$core$Native_Utils.update(
						state,
						{
							cursor: _p3._0._1,
							previousControlPoint: _elm_lang$core$Maybe$Just(_p3._0._0)
						});
				}
			case 'EllipticalArc':
				return noControlPoint(
					maybeUpdateCursor(
						A2(
							_elm_lang$core$Maybe$map,
							function (_) {
								return _.target;
							},
							_elm_community$list_extra$List_Extra$last(_p1._0))));
			default:
				return noControlPoint(state);
		}
	});
var _folkertdev$one_true_path_experiment$LowLevel_Command$makeControlPointExplicitVec2 = F2(
	function (initial, withoutContolPoint) {
		var folder = F2(
			function (_p5, _p4) {
				var _p6 = _p5;
				var _p10 = _p6._1;
				var _p9 = _p6._0;
				var _p7 = _p4;
				var _p8 = _p7._0;
				var previousControlPoint = A2(_elm_lang$core$Maybe$withDefault, _p8.cursor, _p8.previousControlPoint);
				var newControlPoint = A2(
					_Zinggi$elm_webgl_math$Vector2$add,
					_p8.cursor,
					_Zinggi$elm_webgl_math$Vector2$negate(
						A2(_Zinggi$elm_webgl_math$Vector2$sub, previousControlPoint, _p8.cursor)));
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						_p8,
						{
							cursor: _p10,
							previousControlPoint: _elm_lang$core$Maybe$Just(_p9)
						}),
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple3', _0: newControlPoint, _1: _p9, _2: _p10},
						_1: _p7._1
					}
				};
			});
		return A2(
			_elm_lang$core$Tuple$mapSecond,
			_elm_lang$core$List$reverse,
			A3(
				_elm_lang$core$List$foldl,
				folder,
				{
					ctor: '_Tuple2',
					_0: initial,
					_1: {ctor: '[]'}
				},
				withoutContolPoint));
	});
var _folkertdev$one_true_path_experiment$LowLevel_Command$makeControlPointExplicitVec1 = F2(
	function (initial, withoutContolPoint) {
		var folder = F2(
			function (target, _p11) {
				var _p12 = _p11;
				var _p13 = _p12._0;
				var previousControlPoint = A2(_elm_lang$core$Maybe$withDefault, _p13.cursor, _p13.previousControlPoint);
				var newControlPoint = A2(
					_Zinggi$elm_webgl_math$Vector2$add,
					_p13.cursor,
					_Zinggi$elm_webgl_math$Vector2$negate(
						A2(_Zinggi$elm_webgl_math$Vector2$sub, previousControlPoint, _p13.cursor)));
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						_p13,
						{
							cursor: target,
							previousControlPoint: _elm_lang$core$Maybe$Just(newControlPoint)
						}),
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: newControlPoint, _1: target},
						_1: _p12._1
					}
				};
			});
		return A2(
			_elm_lang$core$Tuple$mapSecond,
			_elm_lang$core$List$reverse,
			A3(
				_elm_lang$core$List$foldl,
				folder,
				{
					ctor: '_Tuple2',
					_0: initial,
					_1: {ctor: '[]'}
				},
				withoutContolPoint));
	});
var _folkertdev$one_true_path_experiment$LowLevel_Command$toLowLevelDrawTo = function (drawto) {
	var _p14 = drawto;
	switch (_p14.ctor) {
		case 'LineTo':
			return A2(_folkertdev$svg_path_lowlevel$Path_LowLevel$LineTo, _folkertdev$svg_path_lowlevel$Path_LowLevel$Absolute, _p14._0);
		case 'Horizontal':
			return A2(_folkertdev$svg_path_lowlevel$Path_LowLevel$Horizontal, _folkertdev$svg_path_lowlevel$Path_LowLevel$Absolute, _p14._0);
		case 'Vertical':
			return A2(_folkertdev$svg_path_lowlevel$Path_LowLevel$Vertical, _folkertdev$svg_path_lowlevel$Path_LowLevel$Absolute, _p14._0);
		case 'CurveTo':
			return A2(_folkertdev$svg_path_lowlevel$Path_LowLevel$CurveTo, _folkertdev$svg_path_lowlevel$Path_LowLevel$Absolute, _p14._0);
		case 'QuadraticBezierCurveTo':
			return A2(_folkertdev$svg_path_lowlevel$Path_LowLevel$QuadraticBezierCurveTo, _folkertdev$svg_path_lowlevel$Path_LowLevel$Absolute, _p14._0);
		case 'EllipticalArc':
			return A2(_folkertdev$svg_path_lowlevel$Path_LowLevel$EllipticalArc, _folkertdev$svg_path_lowlevel$Path_LowLevel$Absolute, _p14._0);
		default:
			return _folkertdev$svg_path_lowlevel$Path_LowLevel$ClosePath;
	}
};
var _folkertdev$one_true_path_experiment$LowLevel_Command$toLowLevelMoveTo = function (_p15) {
	var _p16 = _p15;
	return A2(_folkertdev$svg_path_lowlevel$Path_LowLevel$MoveTo, _folkertdev$svg_path_lowlevel$Path_LowLevel$Absolute, _p16._0);
};
var _folkertdev$one_true_path_experiment$LowLevel_Command$last = A2(
	_elm_lang$core$List$foldr,
	F2(
		function (element, accum) {
			return _elm_lang$core$Native_Utils.eq(accum, _elm_lang$core$Maybe$Nothing) ? _elm_lang$core$Maybe$Just(element) : accum;
		}),
	_elm_lang$core$Maybe$Nothing);
var _folkertdev$one_true_path_experiment$LowLevel_Command$coordinatesToAbsolute = F3(
	function (mode, toAbsolute, coordinates) {
		var _p17 = mode;
		if (_p17.ctor === 'Absolute') {
			return A2(
				_elm_lang$core$Maybe$map,
				function ($final) {
					return {ctor: '_Tuple2', _0: $final, _1: coordinates};
				},
				_folkertdev$one_true_path_experiment$LowLevel_Command$last(coordinates));
		} else {
			var folder = F3(
				function (f, element, _p18) {
					var _p19 = _p18;
					var _p22 = _p19._1;
					var _p21 = _p19._0;
					var _p20 = _p22;
					if (_p20.ctor === 'Nothing') {
						return {
							ctor: '_Tuple2',
							_0: {
								ctor: '::',
								_0: f(element),
								_1: _p21
							},
							_1: _elm_lang$core$Maybe$Just(element)
						};
					} else {
						return {
							ctor: '_Tuple2',
							_0: {
								ctor: '::',
								_0: f(element),
								_1: _p21
							},
							_1: _p22
						};
					}
				});
			var _p23 = A3(
				_elm_lang$core$List$foldr,
				folder(toAbsolute),
				{
					ctor: '_Tuple2',
					_0: {ctor: '[]'},
					_1: _elm_lang$core$Maybe$Nothing
				},
				coordinates);
			if (_p23._1.ctor === 'Nothing') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				return _elm_lang$core$Maybe$Just(
					{
						ctor: '_Tuple2',
						_0: toAbsolute(_p23._1._0),
						_1: _p23._0
					});
			}
		}
	});
var _folkertdev$one_true_path_experiment$LowLevel_Command$smallestArc = _folkertdev$svg_path_lowlevel$Path_LowLevel$SmallestArc;
var _folkertdev$one_true_path_experiment$LowLevel_Command$largestArc = _folkertdev$svg_path_lowlevel$Path_LowLevel$LargestArc;
var _folkertdev$one_true_path_experiment$LowLevel_Command$counterClockwise = _folkertdev$svg_path_lowlevel$Path_LowLevel$CounterClockwise;
var _folkertdev$one_true_path_experiment$LowLevel_Command$clockwise = _folkertdev$svg_path_lowlevel$Path_LowLevel$Clockwise;
var _folkertdev$one_true_path_experiment$LowLevel_Command$EllipticalArcArgument = F5(
	function (a, b, c, d, e) {
		return {radii: a, xAxisRotate: b, arcFlag: c, direction: d, target: e};
	});
var _folkertdev$one_true_path_experiment$LowLevel_Command$CursorState = F3(
	function (a, b, c) {
		return {start: a, cursor: b, previousControlPoint: c};
	});
var _folkertdev$one_true_path_experiment$LowLevel_Command$MoveTo = function (a) {
	return {ctor: 'MoveTo', _0: a};
};
var _folkertdev$one_true_path_experiment$LowLevel_Command$moveTo = _folkertdev$one_true_path_experiment$LowLevel_Command$MoveTo;
var _folkertdev$one_true_path_experiment$LowLevel_Command$fromLowLevelMoveTo = F2(
	function (_p25, _p24) {
		var _p26 = _p25;
		var _p30 = _p26._1;
		var _p27 = _p24;
		var _p29 = _p27;
		var _p28 = _p26._0;
		if (_p28.ctor === 'Absolute') {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					_p29,
					{start: _p30, cursor: _p30, previousControlPoint: _elm_lang$core$Maybe$Nothing}),
				_1: _folkertdev$one_true_path_experiment$LowLevel_Command$MoveTo(_p30)
			};
		} else {
			var absoluteTarget = A2(_Zinggi$elm_webgl_math$Vector2$add, _p30, _p27.cursor);
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					_p29,
					{start: absoluteTarget, cursor: absoluteTarget, previousControlPoint: _elm_lang$core$Maybe$Nothing}),
				_1: _folkertdev$one_true_path_experiment$LowLevel_Command$MoveTo(absoluteTarget)
			};
		}
	});
var _folkertdev$one_true_path_experiment$LowLevel_Command$ClosePath = {ctor: 'ClosePath'};
var _folkertdev$one_true_path_experiment$LowLevel_Command$closePath = _folkertdev$one_true_path_experiment$LowLevel_Command$ClosePath;
var _folkertdev$one_true_path_experiment$LowLevel_Command$EllipticalArc = function (a) {
	return {ctor: 'EllipticalArc', _0: a};
};
var _folkertdev$one_true_path_experiment$LowLevel_Command$arcTo = _folkertdev$one_true_path_experiment$LowLevel_Command$EllipticalArc;
var _folkertdev$one_true_path_experiment$LowLevel_Command$QuadraticBezierCurveTo = function (a) {
	return {ctor: 'QuadraticBezierCurveTo', _0: a};
};
var _folkertdev$one_true_path_experiment$LowLevel_Command$quadraticCurveTo = _folkertdev$one_true_path_experiment$LowLevel_Command$QuadraticBezierCurveTo;
var _folkertdev$one_true_path_experiment$LowLevel_Command$CurveTo = function (a) {
	return {ctor: 'CurveTo', _0: a};
};
var _folkertdev$one_true_path_experiment$LowLevel_Command$cubicCurveTo = _folkertdev$one_true_path_experiment$LowLevel_Command$CurveTo;
var _folkertdev$one_true_path_experiment$LowLevel_Command$Vertical = function (a) {
	return {ctor: 'Vertical', _0: a};
};
var _folkertdev$one_true_path_experiment$LowLevel_Command$verticalTo = _folkertdev$one_true_path_experiment$LowLevel_Command$Vertical;
var _folkertdev$one_true_path_experiment$LowLevel_Command$Horizontal = function (a) {
	return {ctor: 'Horizontal', _0: a};
};
var _folkertdev$one_true_path_experiment$LowLevel_Command$horizontalTo = _folkertdev$one_true_path_experiment$LowLevel_Command$Horizontal;
var _folkertdev$one_true_path_experiment$LowLevel_Command$LineTo = function (a) {
	return {ctor: 'LineTo', _0: a};
};
var _folkertdev$one_true_path_experiment$LowLevel_Command$lineTo = _folkertdev$one_true_path_experiment$LowLevel_Command$LineTo;
var _folkertdev$one_true_path_experiment$LowLevel_Command$fromLowLevelDrawTo = F2(
	function (drawto, _p31) {
		var _p32 = _p31;
		var _p53 = _p32;
		var _p52 = _p32.cursor;
		var _p33 = drawto;
		switch (_p33.ctor) {
			case 'LineTo':
				var updateState = function (_p34) {
					var _p35 = _p34;
					return {
						ctor: '_Tuple2',
						_0: _folkertdev$one_true_path_experiment$LowLevel_Command$LineTo(_p35._1),
						_1: _elm_lang$core$Native_Utils.update(
							_p53,
							{cursor: _p35._0, previousControlPoint: _elm_lang$core$Maybe$Nothing})
					};
				};
				return A2(
					_elm_lang$core$Maybe$map,
					updateState,
					A3(
						_folkertdev$one_true_path_experiment$LowLevel_Command$coordinatesToAbsolute,
						_p33._0,
						_Zinggi$elm_webgl_math$Vector2$add(_p52),
						_p33._1));
			case 'Horizontal':
				var updateState = function (_p36) {
					var _p37 = _p36;
					return {
						ctor: '_Tuple2',
						_0: _folkertdev$one_true_path_experiment$LowLevel_Command$LineTo(_p37._1),
						_1: _elm_lang$core$Native_Utils.update(
							_p53,
							{
								cursor: {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Tuple$first(_p37._0),
									_1: _elm_lang$core$Tuple$second(_p52)
								},
								previousControlPoint: _elm_lang$core$Maybe$Nothing
							})
					};
				};
				return A2(
					_elm_lang$core$Maybe$map,
					updateState,
					A3(
						_folkertdev$one_true_path_experiment$LowLevel_Command$coordinatesToAbsolute,
						_p33._0,
						_Zinggi$elm_webgl_math$Vector2$add(_p52),
						A2(
							_elm_lang$core$List$map,
							function (x) {
								return {ctor: '_Tuple2', _0: x, _1: 0};
							},
							_p33._1)));
			case 'Vertical':
				var updateState = function (_p38) {
					var _p39 = _p38;
					return {
						ctor: '_Tuple2',
						_0: _folkertdev$one_true_path_experiment$LowLevel_Command$LineTo(_p39._1),
						_1: _elm_lang$core$Native_Utils.update(
							_p53,
							{
								cursor: {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Tuple$first(_p52),
									_1: _elm_lang$core$Tuple$second(_p39._0)
								},
								previousControlPoint: _elm_lang$core$Maybe$Nothing
							})
					};
				};
				return A2(
					_elm_lang$core$Maybe$map,
					updateState,
					A3(
						_folkertdev$one_true_path_experiment$LowLevel_Command$coordinatesToAbsolute,
						_p33._0,
						_Zinggi$elm_webgl_math$Vector2$add(_p52),
						A2(
							_elm_lang$core$List$map,
							function (y) {
								return {ctor: '_Tuple2', _0: 0, _1: y};
							},
							_p33._1)));
			case 'CurveTo':
				var updateState = function (_p40) {
					var _p41 = _p40;
					return {
						ctor: '_Tuple2',
						_0: _folkertdev$one_true_path_experiment$LowLevel_Command$CurveTo(_p41._1),
						_1: _elm_lang$core$Native_Utils.update(
							_p53,
							{
								cursor: _p41._0._2,
								previousControlPoint: _elm_lang$core$Maybe$Just(_p41._0._1)
							})
					};
				};
				return A2(
					_elm_lang$core$Maybe$map,
					updateState,
					A3(
						_folkertdev$one_true_path_experiment$LowLevel_Command$coordinatesToAbsolute,
						_p33._0,
						_Zinggi$elm_webgl_math$Vector3$map(
							_Zinggi$elm_webgl_math$Vector2$add(_p52)),
						_p33._1));
			case 'SmoothCurveTo':
				var updateState = function (_p42) {
					var _p43 = _p42;
					return {
						ctor: '_Tuple2',
						_0: _folkertdev$one_true_path_experiment$LowLevel_Command$CurveTo(_p43._1),
						_1: _p43._0
					};
				};
				return A2(
					_elm_lang$core$Maybe$map,
					function (_p44) {
						return updateState(
							A2(
								_folkertdev$one_true_path_experiment$LowLevel_Command$makeControlPointExplicitVec2,
								_p53,
								_elm_lang$core$Tuple$second(_p44)));
					},
					A3(
						_folkertdev$one_true_path_experiment$LowLevel_Command$coordinatesToAbsolute,
						_p33._0,
						_Zinggi$elm_webgl_math$Vector2$map(
							_Zinggi$elm_webgl_math$Vector2$add(_p52)),
						_p33._1));
			case 'QuadraticBezierCurveTo':
				var updateState = function (_p45) {
					var _p46 = _p45;
					return {
						ctor: '_Tuple2',
						_0: _folkertdev$one_true_path_experiment$LowLevel_Command$QuadraticBezierCurveTo(_p46._1),
						_1: _elm_lang$core$Native_Utils.update(
							_p53,
							{
								cursor: _p46._0._1,
								previousControlPoint: _elm_lang$core$Maybe$Just(_p46._0._0)
							})
					};
				};
				return A2(
					_elm_lang$core$Maybe$map,
					updateState,
					A3(
						_folkertdev$one_true_path_experiment$LowLevel_Command$coordinatesToAbsolute,
						_p33._0,
						_Zinggi$elm_webgl_math$Vector2$map(
							_Zinggi$elm_webgl_math$Vector2$add(_p52)),
						_p33._1));
			case 'SmoothQuadraticBezierCurveTo':
				var updateState = function (_p47) {
					var _p48 = _p47;
					return {
						ctor: '_Tuple2',
						_0: _folkertdev$one_true_path_experiment$LowLevel_Command$QuadraticBezierCurveTo(_p48._1),
						_1: _p48._0
					};
				};
				return A2(
					_elm_lang$core$Maybe$map,
					function (_p49) {
						return updateState(
							A2(
								_folkertdev$one_true_path_experiment$LowLevel_Command$makeControlPointExplicitVec1,
								_p53,
								_elm_lang$core$Tuple$second(_p49)));
					},
					A3(
						_folkertdev$one_true_path_experiment$LowLevel_Command$coordinatesToAbsolute,
						_p33._0,
						_Zinggi$elm_webgl_math$Vector2$add(_p52),
						_p33._1));
			case 'EllipticalArc':
				var updateState = function (_p50) {
					var _p51 = _p50;
					return {
						ctor: '_Tuple2',
						_0: _folkertdev$one_true_path_experiment$LowLevel_Command$EllipticalArc(_p51._1),
						_1: _elm_lang$core$Native_Utils.update(
							_p53,
							{cursor: _p51._0.target, previousControlPoint: _elm_lang$core$Maybe$Nothing})
					};
				};
				var argumentToAbsolute = function (argument) {
					return _elm_lang$core$Native_Utils.update(
						argument,
						{
							target: A2(_Zinggi$elm_webgl_math$Vector2$add, _p52, argument.target)
						});
				};
				return A2(
					_elm_lang$core$Maybe$map,
					updateState,
					A3(_folkertdev$one_true_path_experiment$LowLevel_Command$coordinatesToAbsolute, _p33._0, argumentToAbsolute, _p33._1));
			default:
				return _elm_lang$core$Maybe$Just(
					{
						ctor: '_Tuple2',
						_0: _folkertdev$one_true_path_experiment$LowLevel_Command$ClosePath,
						_1: _elm_lang$core$Native_Utils.update(
							_p53,
							{cursor: _p32.start})
					});
		}
	});
var _folkertdev$one_true_path_experiment$LowLevel_Command$fromLowLevelDrawTos = F2(
	function (drawtos, state) {
		var folder = F2(
			function (element, _p54) {
				var _p55 = _p54;
				var _p58 = _p55._0;
				var _p57 = _p55._1;
				var _p56 = A2(_folkertdev$one_true_path_experiment$LowLevel_Command$fromLowLevelDrawTo, element, _p58);
				if (_p56.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _p58, _1: _p57};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _p56._0._1,
						_1: {ctor: '::', _0: _p56._0._0, _1: _p57}
					};
				}
			});
		return A2(
			_elm_lang$core$Tuple$mapSecond,
			_elm_lang$core$List$reverse,
			A3(
				_elm_lang$core$List$foldl,
				folder,
				{
					ctor: '_Tuple2',
					_0: state,
					_1: {ctor: '[]'}
				},
				drawtos));
	});
var _folkertdev$one_true_path_experiment$LowLevel_Command$mapCoordinateDrawTo = F2(
	function (f, drawto) {
		var _p59 = drawto;
		switch (_p59.ctor) {
			case 'LineTo':
				return _folkertdev$one_true_path_experiment$LowLevel_Command$LineTo(
					A2(_elm_lang$core$List$map, f, _p59._0));
			case 'Horizontal':
				return _folkertdev$one_true_path_experiment$LowLevel_Command$Horizontal(
					A2(
						_elm_lang$core$List$map,
						function (_p60) {
							return _elm_lang$core$Tuple$first(
								f(
									function (x) {
										return {ctor: '_Tuple2', _0: x, _1: 0};
									}(_p60)));
						},
						_p59._0));
			case 'Vertical':
				return _folkertdev$one_true_path_experiment$LowLevel_Command$Vertical(
					A2(
						_elm_lang$core$List$map,
						function (_p61) {
							return _elm_lang$core$Tuple$second(
								f(
									function (y) {
										return {ctor: '_Tuple2', _0: 0, _1: y};
									}(_p61)));
						},
						_p59._0));
			case 'CurveTo':
				return _folkertdev$one_true_path_experiment$LowLevel_Command$CurveTo(
					A2(
						_elm_lang$core$List$map,
						_Zinggi$elm_webgl_math$Vector3$map(f),
						_p59._0));
			case 'QuadraticBezierCurveTo':
				return _folkertdev$one_true_path_experiment$LowLevel_Command$QuadraticBezierCurveTo(
					A2(
						_elm_lang$core$List$map,
						_Zinggi$elm_webgl_math$Vector2$map(f),
						_p59._0));
			case 'EllipticalArc':
				return _folkertdev$one_true_path_experiment$LowLevel_Command$EllipticalArc(
					A2(
						_elm_lang$core$List$map,
						function (argument) {
							return _elm_lang$core$Native_Utils.update(
								argument,
								{
									target: f(argument.target)
								});
						},
						_p59._0));
			default:
				return _folkertdev$one_true_path_experiment$LowLevel_Command$ClosePath;
		}
	});
var _folkertdev$one_true_path_experiment$LowLevel_Command$merge = F2(
	function (instruction1, instruction2) {
		var _p62 = {ctor: '_Tuple2', _0: instruction1, _1: instruction2};
		_v28_7:
		do {
			if (_p62.ctor === '_Tuple2') {
				switch (_p62._0.ctor) {
					case 'LineTo':
						if (_p62._1.ctor === 'LineTo') {
							return _elm_lang$core$Result$Ok(
								_folkertdev$one_true_path_experiment$LowLevel_Command$LineTo(
									A2(_elm_lang$core$Basics_ops['++'], _p62._0._0, _p62._1._0)));
						} else {
							break _v28_7;
						}
					case 'Horizontal':
						if (_p62._1.ctor === 'Horizontal') {
							return _elm_lang$core$Result$Ok(
								_folkertdev$one_true_path_experiment$LowLevel_Command$Horizontal(
									A2(_elm_lang$core$Basics_ops['++'], _p62._0._0, _p62._1._0)));
						} else {
							break _v28_7;
						}
					case 'Vertical':
						if (_p62._1.ctor === 'Vertical') {
							return _elm_lang$core$Result$Ok(
								_folkertdev$one_true_path_experiment$LowLevel_Command$Vertical(
									A2(_elm_lang$core$Basics_ops['++'], _p62._0._0, _p62._1._0)));
						} else {
							break _v28_7;
						}
					case 'CurveTo':
						if (_p62._1.ctor === 'CurveTo') {
							return _elm_lang$core$Result$Ok(
								_folkertdev$one_true_path_experiment$LowLevel_Command$CurveTo(
									A2(_elm_lang$core$Basics_ops['++'], _p62._0._0, _p62._1._0)));
						} else {
							break _v28_7;
						}
					case 'QuadraticBezierCurveTo':
						if (_p62._1.ctor === 'QuadraticBezierCurveTo') {
							return _elm_lang$core$Result$Ok(
								_folkertdev$one_true_path_experiment$LowLevel_Command$QuadraticBezierCurveTo(
									A2(_elm_lang$core$Basics_ops['++'], _p62._0._0, _p62._1._0)));
						} else {
							break _v28_7;
						}
					case 'EllipticalArc':
						if (_p62._1.ctor === 'EllipticalArc') {
							return _elm_lang$core$Result$Ok(
								_folkertdev$one_true_path_experiment$LowLevel_Command$EllipticalArc(
									A2(_elm_lang$core$Basics_ops['++'], _p62._0._0, _p62._1._0)));
						} else {
							break _v28_7;
						}
					default:
						if (_p62._1.ctor === 'ClosePath') {
							return _elm_lang$core$Result$Ok(_folkertdev$one_true_path_experiment$LowLevel_Command$ClosePath);
						} else {
							break _v28_7;
						}
				}
			} else {
				break _v28_7;
			}
		} while(false);
		return _elm_lang$core$Result$Err(
			{ctor: '_Tuple2', _0: instruction1, _1: instruction2});
	});

var _opensolid$geometry$OpenSolid_Geometry_Internal$Vector2d = function (a) {
	return {ctor: 'Vector2d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Vector3d = function (a) {
	return {ctor: 'Vector3d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Direction2d = function (a) {
	return {ctor: 'Direction2d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Direction3d = function (a) {
	return {ctor: 'Direction3d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Point2d = function (a) {
	return {ctor: 'Point2d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Point3d = function (a) {
	return {ctor: 'Point3d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Axis2d = function (a) {
	return {ctor: 'Axis2d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Axis3d = function (a) {
	return {ctor: 'Axis3d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Plane3d = function (a) {
	return {ctor: 'Plane3d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Frame2d = function (a) {
	return {ctor: 'Frame2d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Frame3d = function (a) {
	return {ctor: 'Frame3d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$SketchPlane3d = function (a) {
	return {ctor: 'SketchPlane3d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$LineSegment2d = function (a) {
	return {ctor: 'LineSegment2d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$LineSegment3d = function (a) {
	return {ctor: 'LineSegment3d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Triangle2d = function (a) {
	return {ctor: 'Triangle2d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Triangle3d = function (a) {
	return {ctor: 'Triangle3d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$BoundingBox2d = function (a) {
	return {ctor: 'BoundingBox2d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$BoundingBox3d = function (a) {
	return {ctor: 'BoundingBox3d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Rectangle2d = function (a) {
	return {ctor: 'Rectangle2d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Rectangle3d = function (a) {
	return {ctor: 'Rectangle3d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Block3d = function (a) {
	return {ctor: 'Block3d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Polyline2d = function (a) {
	return {ctor: 'Polyline2d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Polyline3d = function (a) {
	return {ctor: 'Polyline3d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Polygon2d = function (a) {
	return {ctor: 'Polygon2d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Circle2d = function (a) {
	return {ctor: 'Circle2d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Circle3d = function (a) {
	return {ctor: 'Circle3d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Arc2d = function (a) {
	return {ctor: 'Arc2d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$Arc3d = function (a) {
	return {ctor: 'Arc3d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$QuadraticSpline2d = function (a) {
	return {ctor: 'QuadraticSpline2d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$QuadraticSpline3d = function (a) {
	return {ctor: 'QuadraticSpline3d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$CubicSpline2d = function (a) {
	return {ctor: 'CubicSpline2d', _0: a};
};
var _opensolid$geometry$OpenSolid_Geometry_Internal$CubicSpline3d = function (a) {
	return {ctor: 'CubicSpline3d', _0: a};
};

var _opensolid$geometry$OpenSolid_Bootstrap_Direction2d$components = function (_p0) {
	var _p1 = _p0;
	return _p1._0;
};
var _opensolid$geometry$OpenSolid_Bootstrap_Direction2d$unsafe = _opensolid$geometry$OpenSolid_Geometry_Internal$Direction2d;
var _opensolid$geometry$OpenSolid_Bootstrap_Direction2d$flip = function (direction) {
	var _p2 = _opensolid$geometry$OpenSolid_Bootstrap_Direction2d$components(direction);
	var x = _p2._0;
	var y = _p2._1;
	return _opensolid$geometry$OpenSolid_Bootstrap_Direction2d$unsafe(
		{ctor: '_Tuple2', _0: 0 - x, _1: 0 - y});
};
var _opensolid$geometry$OpenSolid_Bootstrap_Direction2d$perpendicularTo = function (direction) {
	var _p3 = _opensolid$geometry$OpenSolid_Bootstrap_Direction2d$components(direction);
	var x = _p3._0;
	var y = _p3._1;
	return _opensolid$geometry$OpenSolid_Bootstrap_Direction2d$unsafe(
		{ctor: '_Tuple2', _0: 0 - y, _1: x});
};

var _opensolid$geometry$OpenSolid_Bootstrap_Axis2d$direction = function (_p0) {
	var _p1 = _p0;
	return _p1._0.direction;
};
var _opensolid$geometry$OpenSolid_Bootstrap_Axis2d$originPoint = function (_p2) {
	var _p3 = _p2;
	return _p3._0.originPoint;
};

var _opensolid$geometry$OpenSolid_Bootstrap_Frame2d$yDirection = function (_p0) {
	var _p1 = _p0;
	return _p1._0.yDirection;
};
var _opensolid$geometry$OpenSolid_Bootstrap_Frame2d$xDirection = function (_p2) {
	var _p3 = _p2;
	return _p3._0.xDirection;
};
var _opensolid$geometry$OpenSolid_Bootstrap_Frame2d$originPoint = function (_p4) {
	var _p5 = _p4;
	return _p5._0.originPoint;
};

var _opensolid$geometry$OpenSolid_Bootstrap_Point2d$coordinates = function (_p0) {
	var _p1 = _p0;
	return _p1._0;
};
var _opensolid$geometry$OpenSolid_Bootstrap_Point2d$fromCoordinates = _opensolid$geometry$OpenSolid_Geometry_Internal$Point2d;

var _opensolid$geometry$OpenSolid_Scalar$interpolateFrom = F3(
	function (start, end, parameter) {
		return (_elm_lang$core$Native_Utils.cmp(parameter, 0.5) < 1) ? (start + (parameter * (end - start))) : (end + ((1 - parameter) * (start - end)));
	});
var _opensolid$geometry$OpenSolid_Scalar$equalWithin = F3(
	function (tolerance, firstValue, secondValue) {
		return _elm_lang$core$Native_Utils.cmp(
			_elm_lang$core$Basics$abs(secondValue - firstValue),
			tolerance) < 1;
	});

var _opensolid$geometry$OpenSolid_Vector2d$yComponent = function (_p0) {
	var _p1 = _p0;
	return _p1._0._1;
};
var _opensolid$geometry$OpenSolid_Vector2d$xComponent = function (_p2) {
	var _p3 = _p2;
	return _p3._0._0;
};
var _opensolid$geometry$OpenSolid_Vector2d$components = function (_p4) {
	var _p5 = _p4;
	return _p5._0;
};
var _opensolid$geometry$OpenSolid_Vector2d$componentIn = F2(
	function (direction, vector) {
		var _p6 = _opensolid$geometry$OpenSolid_Vector2d$components(vector);
		var vx = _p6._0;
		var vy = _p6._1;
		var _p7 = _opensolid$geometry$OpenSolid_Bootstrap_Direction2d$components(direction);
		var dx = _p7._0;
		var dy = _p7._1;
		return (vx * dx) + (vy * dy);
	});
var _opensolid$geometry$OpenSolid_Vector2d$polarComponents = function (vector) {
	return _elm_lang$core$Basics$toPolar(
		_opensolid$geometry$OpenSolid_Vector2d$components(vector));
};
var _opensolid$geometry$OpenSolid_Vector2d$squaredLength = function (vector) {
	var _p8 = _opensolid$geometry$OpenSolid_Vector2d$components(vector);
	var x = _p8._0;
	var y = _p8._1;
	return (x * x) + (y * y);
};
var _opensolid$geometry$OpenSolid_Vector2d$length = function (vector) {
	return _elm_lang$core$Basics$sqrt(
		_opensolid$geometry$OpenSolid_Vector2d$squaredLength(vector));
};
var _opensolid$geometry$OpenSolid_Vector2d$dotProduct = F2(
	function (firstVector, secondVector) {
		var _p9 = _opensolid$geometry$OpenSolid_Vector2d$components(secondVector);
		var x2 = _p9._0;
		var y2 = _p9._1;
		var _p10 = _opensolid$geometry$OpenSolid_Vector2d$components(firstVector);
		var x1 = _p10._0;
		var y1 = _p10._1;
		return (x1 * x2) + (y1 * y2);
	});
var _opensolid$geometry$OpenSolid_Vector2d$crossProduct = F2(
	function (firstVector, secondVector) {
		var _p11 = _opensolid$geometry$OpenSolid_Vector2d$components(secondVector);
		var x2 = _p11._0;
		var y2 = _p11._1;
		var _p12 = _opensolid$geometry$OpenSolid_Vector2d$components(firstVector);
		var x1 = _p12._0;
		var y1 = _p12._1;
		return (x1 * y2) - (y1 * x2);
	});
var _opensolid$geometry$OpenSolid_Vector2d$fromComponents = _opensolid$geometry$OpenSolid_Geometry_Internal$Vector2d;
var _opensolid$geometry$OpenSolid_Vector2d$fromPolarComponents = function (components) {
	return _opensolid$geometry$OpenSolid_Vector2d$fromComponents(
		_elm_lang$core$Basics$fromPolar(components));
};
var _opensolid$geometry$OpenSolid_Vector2d$from = F2(
	function (firstPoint, secondPoint) {
		var _p13 = _opensolid$geometry$OpenSolid_Bootstrap_Point2d$coordinates(secondPoint);
		var x2 = _p13._0;
		var y2 = _p13._1;
		var _p14 = _opensolid$geometry$OpenSolid_Bootstrap_Point2d$coordinates(firstPoint);
		var x1 = _p14._0;
		var y1 = _p14._1;
		return _opensolid$geometry$OpenSolid_Vector2d$fromComponents(
			{ctor: '_Tuple2', _0: x2 - x1, _1: y2 - y1});
	});
var _opensolid$geometry$OpenSolid_Vector2d$with = function (_p15) {
	var _p16 = _p15;
	var _p18 = _p16.length;
	var _p17 = _opensolid$geometry$OpenSolid_Bootstrap_Direction2d$components(_p16.direction);
	var dx = _p17._0;
	var dy = _p17._1;
	return _opensolid$geometry$OpenSolid_Vector2d$fromComponents(
		{ctor: '_Tuple2', _0: _p18 * dx, _1: _p18 * dy});
};
var _opensolid$geometry$OpenSolid_Vector2d$projectionIn = F2(
	function (direction, vector) {
		return _opensolid$geometry$OpenSolid_Vector2d$with(
			{
				direction: direction,
				length: A2(_opensolid$geometry$OpenSolid_Vector2d$componentIn, direction, vector)
			});
	});
var _opensolid$geometry$OpenSolid_Vector2d$projectOnto = F2(
	function (axis, vector) {
		return A2(
			_opensolid$geometry$OpenSolid_Vector2d$projectionIn,
			_opensolid$geometry$OpenSolid_Bootstrap_Axis2d$direction(axis),
			vector);
	});
var _opensolid$geometry$OpenSolid_Vector2d$perpendicularTo = function (vector) {
	var _p19 = _opensolid$geometry$OpenSolid_Vector2d$components(vector);
	var x = _p19._0;
	var y = _p19._1;
	return _opensolid$geometry$OpenSolid_Vector2d$fromComponents(
		{ctor: '_Tuple2', _0: 0 - y, _1: x});
};
var _opensolid$geometry$OpenSolid_Vector2d$interpolateFrom = F3(
	function (v1, v2, t) {
		var _p20 = _opensolid$geometry$OpenSolid_Vector2d$components(v2);
		var x2 = _p20._0;
		var y2 = _p20._1;
		var _p21 = _opensolid$geometry$OpenSolid_Vector2d$components(v1);
		var x1 = _p21._0;
		var y1 = _p21._1;
		return _opensolid$geometry$OpenSolid_Vector2d$fromComponents(
			{
				ctor: '_Tuple2',
				_0: A3(_opensolid$geometry$OpenSolid_Scalar$interpolateFrom, x1, x2, t),
				_1: A3(_opensolid$geometry$OpenSolid_Scalar$interpolateFrom, y1, y2, t)
			});
	});
var _opensolid$geometry$OpenSolid_Vector2d$sum = F2(
	function (firstVector, secondVector) {
		var _p22 = _opensolid$geometry$OpenSolid_Vector2d$components(secondVector);
		var x2 = _p22._0;
		var y2 = _p22._1;
		var _p23 = _opensolid$geometry$OpenSolid_Vector2d$components(firstVector);
		var x1 = _p23._0;
		var y1 = _p23._1;
		return _opensolid$geometry$OpenSolid_Vector2d$fromComponents(
			{ctor: '_Tuple2', _0: x1 + x2, _1: y1 + y2});
	});
var _opensolid$geometry$OpenSolid_Vector2d$difference = F2(
	function (firstVector, secondVector) {
		var _p24 = _opensolid$geometry$OpenSolid_Vector2d$components(secondVector);
		var x2 = _p24._0;
		var y2 = _p24._1;
		var _p25 = _opensolid$geometry$OpenSolid_Vector2d$components(firstVector);
		var x1 = _p25._0;
		var y1 = _p25._1;
		return _opensolid$geometry$OpenSolid_Vector2d$fromComponents(
			{ctor: '_Tuple2', _0: x1 - x2, _1: y1 - y2});
	});
var _opensolid$geometry$OpenSolid_Vector2d$equalWithin = F3(
	function (tolerance, firstVector, secondVector) {
		return _elm_lang$core$Native_Utils.cmp(
			_opensolid$geometry$OpenSolid_Vector2d$squaredLength(
				A2(_opensolid$geometry$OpenSolid_Vector2d$difference, firstVector, secondVector)),
			tolerance * tolerance) < 1;
	});
var _opensolid$geometry$OpenSolid_Vector2d$flip = function (vector) {
	var _p26 = _opensolid$geometry$OpenSolid_Vector2d$components(vector);
	var x = _p26._0;
	var y = _p26._1;
	return _opensolid$geometry$OpenSolid_Vector2d$fromComponents(
		{ctor: '_Tuple2', _0: 0 - x, _1: 0 - y});
};
var _opensolid$geometry$OpenSolid_Vector2d$scaleBy = F2(
	function (scale, vector) {
		var _p27 = _opensolid$geometry$OpenSolid_Vector2d$components(vector);
		var x = _p27._0;
		var y = _p27._1;
		return _opensolid$geometry$OpenSolid_Vector2d$fromComponents(
			{ctor: '_Tuple2', _0: x * scale, _1: y * scale});
	});
var _opensolid$geometry$OpenSolid_Vector2d$lengthAndDirection = function (vector) {
	var vectorLength = _opensolid$geometry$OpenSolid_Vector2d$length(vector);
	if (_elm_lang$core$Native_Utils.eq(vectorLength, 0.0)) {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		var normalizedVector = A2(_opensolid$geometry$OpenSolid_Vector2d$scaleBy, 1 / vectorLength, vector);
		var vectorDirection = _opensolid$geometry$OpenSolid_Bootstrap_Direction2d$unsafe(
			_opensolid$geometry$OpenSolid_Vector2d$components(normalizedVector));
		return _elm_lang$core$Maybe$Just(
			{ctor: '_Tuple2', _0: vectorLength, _1: vectorDirection});
	}
};
var _opensolid$geometry$OpenSolid_Vector2d$rotateBy = function (angle) {
	var sine = _elm_lang$core$Basics$sin(angle);
	var cosine = _elm_lang$core$Basics$cos(angle);
	return function (vector) {
		var _p28 = _opensolid$geometry$OpenSolid_Vector2d$components(vector);
		var x = _p28._0;
		var y = _p28._1;
		return _opensolid$geometry$OpenSolid_Vector2d$fromComponents(
			{ctor: '_Tuple2', _0: (x * cosine) - (y * sine), _1: (y * cosine) + (x * sine)});
	};
};
var _opensolid$geometry$OpenSolid_Vector2d$mirrorAcross = function (axis) {
	var _p29 = _opensolid$geometry$OpenSolid_Bootstrap_Direction2d$components(
		_opensolid$geometry$OpenSolid_Bootstrap_Axis2d$direction(axis));
	var dx = _p29._0;
	var dy = _p29._1;
	var a = 1 - ((2 * dy) * dy);
	var b = (2 * dx) * dy;
	var c = 1 - ((2 * dx) * dx);
	return function (vector) {
		var _p30 = _opensolid$geometry$OpenSolid_Vector2d$components(vector);
		var vx = _p30._0;
		var vy = _p30._1;
		return _opensolid$geometry$OpenSolid_Vector2d$fromComponents(
			{ctor: '_Tuple2', _0: (a * vx) + (b * vy), _1: (c * vy) + (b * vx)});
	};
};
var _opensolid$geometry$OpenSolid_Vector2d$relativeTo = F2(
	function (frame, vector) {
		return _opensolid$geometry$OpenSolid_Vector2d$fromComponents(
			{
				ctor: '_Tuple2',
				_0: A2(
					_opensolid$geometry$OpenSolid_Vector2d$componentIn,
					_opensolid$geometry$OpenSolid_Bootstrap_Frame2d$xDirection(frame),
					vector),
				_1: A2(
					_opensolid$geometry$OpenSolid_Vector2d$componentIn,
					_opensolid$geometry$OpenSolid_Bootstrap_Frame2d$yDirection(frame),
					vector)
			});
	});
var _opensolid$geometry$OpenSolid_Vector2d$placeIn = function (frame) {
	var _p31 = _opensolid$geometry$OpenSolid_Bootstrap_Direction2d$components(
		_opensolid$geometry$OpenSolid_Bootstrap_Frame2d$yDirection(frame));
	var x2 = _p31._0;
	var y2 = _p31._1;
	var _p32 = _opensolid$geometry$OpenSolid_Bootstrap_Direction2d$components(
		_opensolid$geometry$OpenSolid_Bootstrap_Frame2d$xDirection(frame));
	var x1 = _p32._0;
	var y1 = _p32._1;
	return function (vector) {
		var _p33 = _opensolid$geometry$OpenSolid_Vector2d$components(vector);
		var x = _p33._0;
		var y = _p33._1;
		return _opensolid$geometry$OpenSolid_Vector2d$fromComponents(
			{ctor: '_Tuple2', _0: (x1 * x) + (x2 * y), _1: (y1 * x) + (y2 * y)});
	};
};
var _opensolid$geometry$OpenSolid_Vector2d$zero = _opensolid$geometry$OpenSolid_Vector2d$fromComponents(
	{ctor: '_Tuple2', _0: 0, _1: 0});
var _opensolid$geometry$OpenSolid_Vector2d$direction = function (vector) {
	if (_elm_lang$core$Native_Utils.eq(vector, _opensolid$geometry$OpenSolid_Vector2d$zero)) {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		var normalizedVector = A2(
			_opensolid$geometry$OpenSolid_Vector2d$scaleBy,
			1 / _opensolid$geometry$OpenSolid_Vector2d$length(vector),
			vector);
		return _elm_lang$core$Maybe$Just(
			_opensolid$geometry$OpenSolid_Bootstrap_Direction2d$unsafe(
				_opensolid$geometry$OpenSolid_Vector2d$components(normalizedVector)));
	}
};
var _opensolid$geometry$OpenSolid_Vector2d$normalize = function (vector) {
	return _elm_lang$core$Native_Utils.eq(vector, _opensolid$geometry$OpenSolid_Vector2d$zero) ? _opensolid$geometry$OpenSolid_Vector2d$zero : A2(
		_opensolid$geometry$OpenSolid_Vector2d$scaleBy,
		1 / _opensolid$geometry$OpenSolid_Vector2d$length(vector),
		vector);
};

var _opensolid$geometry$OpenSolid_Direction2d$flip = _opensolid$geometry$OpenSolid_Bootstrap_Direction2d$flip;
var _opensolid$geometry$OpenSolid_Direction2d$yComponent = function (_p0) {
	var _p1 = _p0;
	return _p1._0._1;
};
var _opensolid$geometry$OpenSolid_Direction2d$xComponent = function (_p2) {
	var _p3 = _p2;
	return _p3._0._0;
};
var _opensolid$geometry$OpenSolid_Direction2d$components = _opensolid$geometry$OpenSolid_Bootstrap_Direction2d$components;
var _opensolid$geometry$OpenSolid_Direction2d$toVector = function (direction) {
	return _opensolid$geometry$OpenSolid_Vector2d$fromComponents(
		_opensolid$geometry$OpenSolid_Direction2d$components(direction));
};
var _opensolid$geometry$OpenSolid_Direction2d$componentIn = F2(
	function (firstDirection, secondDirection) {
		return A2(
			_opensolid$geometry$OpenSolid_Vector2d$componentIn,
			firstDirection,
			_opensolid$geometry$OpenSolid_Direction2d$toVector(secondDirection));
	});
var _opensolid$geometry$OpenSolid_Direction2d$angleFrom = F2(
	function (firstDirection, secondDirection) {
		var secondVector = _opensolid$geometry$OpenSolid_Direction2d$toVector(secondDirection);
		var firstVector = _opensolid$geometry$OpenSolid_Direction2d$toVector(firstDirection);
		return A2(
			_elm_lang$core$Basics$atan2,
			A2(_opensolid$geometry$OpenSolid_Vector2d$crossProduct, firstVector, secondVector),
			A2(_opensolid$geometry$OpenSolid_Vector2d$dotProduct, firstVector, secondVector));
	});
var _opensolid$geometry$OpenSolid_Direction2d$equalWithin = F3(
	function (angle, firstDirection, secondDirection) {
		return _elm_lang$core$Native_Utils.cmp(
			_elm_lang$core$Basics$abs(
				A2(_opensolid$geometry$OpenSolid_Direction2d$angleFrom, firstDirection, secondDirection)),
			angle) < 1;
	});
var _opensolid$geometry$OpenSolid_Direction2d$angle = function (direction) {
	var _p4 = _opensolid$geometry$OpenSolid_Direction2d$components(direction);
	var x = _p4._0;
	var y = _p4._1;
	return A2(_elm_lang$core$Basics$atan2, y, x);
};
var _opensolid$geometry$OpenSolid_Direction2d$perpendicularTo = _opensolid$geometry$OpenSolid_Bootstrap_Direction2d$perpendicularTo;
var _opensolid$geometry$OpenSolid_Direction2d$orthonormalize = function (_p5) {
	var _p6 = _p5;
	return A2(
		_elm_lang$core$Maybe$andThen,
		function (xDirection) {
			var yDirection = _opensolid$geometry$OpenSolid_Direction2d$perpendicularTo(xDirection);
			var perpendicularComponent = A2(_opensolid$geometry$OpenSolid_Vector2d$componentIn, yDirection, _p6._1);
			return (_elm_lang$core$Native_Utils.cmp(perpendicularComponent, 0.0) > 0) ? _elm_lang$core$Maybe$Just(
				{ctor: '_Tuple2', _0: xDirection, _1: yDirection}) : ((_elm_lang$core$Native_Utils.cmp(perpendicularComponent, 0.0) < 0) ? _elm_lang$core$Maybe$Just(
				{
					ctor: '_Tuple2',
					_0: xDirection,
					_1: _opensolid$geometry$OpenSolid_Direction2d$flip(yDirection)
				}) : _elm_lang$core$Maybe$Nothing);
		},
		_opensolid$geometry$OpenSolid_Vector2d$direction(_p6._0));
};
var _opensolid$geometry$OpenSolid_Direction2d$orthogonalize = function (_p7) {
	var _p8 = _p7;
	return _opensolid$geometry$OpenSolid_Direction2d$orthonormalize(
		{
			ctor: '_Tuple2',
			_0: _opensolid$geometry$OpenSolid_Direction2d$toVector(_p8._0),
			_1: _opensolid$geometry$OpenSolid_Direction2d$toVector(_p8._1)
		});
};
var _opensolid$geometry$OpenSolid_Direction2d$from = F2(
	function (firstPoint, secondPoint) {
		return _opensolid$geometry$OpenSolid_Vector2d$direction(
			A2(_opensolid$geometry$OpenSolid_Vector2d$from, firstPoint, secondPoint));
	});
var _opensolid$geometry$OpenSolid_Direction2d$unsafe = _opensolid$geometry$OpenSolid_Geometry_Internal$Direction2d;
var _opensolid$geometry$OpenSolid_Direction2d$fromAngle = function (angle) {
	return _opensolid$geometry$OpenSolid_Direction2d$unsafe(
		{
			ctor: '_Tuple2',
			_0: _elm_lang$core$Basics$cos(angle),
			_1: _elm_lang$core$Basics$sin(angle)
		});
};
var _opensolid$geometry$OpenSolid_Direction2d$negativeY = _opensolid$geometry$OpenSolid_Direction2d$unsafe(
	{ctor: '_Tuple2', _0: 0, _1: -1});
var _opensolid$geometry$OpenSolid_Direction2d$positiveY = _opensolid$geometry$OpenSolid_Direction2d$unsafe(
	{ctor: '_Tuple2', _0: 0, _1: 1});
var _opensolid$geometry$OpenSolid_Direction2d$negativeX = _opensolid$geometry$OpenSolid_Direction2d$unsafe(
	{ctor: '_Tuple2', _0: -1, _1: 0});
var _opensolid$geometry$OpenSolid_Direction2d$positiveX = _opensolid$geometry$OpenSolid_Direction2d$unsafe(
	{ctor: '_Tuple2', _0: 1, _1: 0});
var _opensolid$geometry$OpenSolid_Direction2d$y = _opensolid$geometry$OpenSolid_Direction2d$unsafe(
	{ctor: '_Tuple2', _0: 0, _1: 1});
var _opensolid$geometry$OpenSolid_Direction2d$x = _opensolid$geometry$OpenSolid_Direction2d$unsafe(
	{ctor: '_Tuple2', _0: 1, _1: 0});
var _opensolid$geometry$OpenSolid_Direction2d$toDirection = function (vector) {
	return _opensolid$geometry$OpenSolid_Direction2d$unsafe(
		_opensolid$geometry$OpenSolid_Vector2d$components(vector));
};
var _opensolid$geometry$OpenSolid_Direction2d$rotateBy = F2(
	function (angle, direction) {
		return _opensolid$geometry$OpenSolid_Direction2d$toDirection(
			A2(
				_opensolid$geometry$OpenSolid_Vector2d$rotateBy,
				angle,
				_opensolid$geometry$OpenSolid_Direction2d$toVector(direction)));
	});
var _opensolid$geometry$OpenSolid_Direction2d$mirrorAcross = F2(
	function (axis, direction) {
		return _opensolid$geometry$OpenSolid_Direction2d$toDirection(
			A2(
				_opensolid$geometry$OpenSolid_Vector2d$mirrorAcross,
				axis,
				_opensolid$geometry$OpenSolid_Direction2d$toVector(direction)));
	});
var _opensolid$geometry$OpenSolid_Direction2d$relativeTo = F2(
	function (frame, direction) {
		return _opensolid$geometry$OpenSolid_Direction2d$toDirection(
			A2(
				_opensolid$geometry$OpenSolid_Vector2d$relativeTo,
				frame,
				_opensolid$geometry$OpenSolid_Direction2d$toVector(direction)));
	});
var _opensolid$geometry$OpenSolid_Direction2d$placeIn = F2(
	function (frame, direction) {
		return _opensolid$geometry$OpenSolid_Direction2d$toDirection(
			A2(
				_opensolid$geometry$OpenSolid_Vector2d$placeIn,
				frame,
				_opensolid$geometry$OpenSolid_Direction2d$toVector(direction)));
	});

var _opensolid$geometry$OpenSolid_Bootstrap_BoundingBox2d$with = function (_p0) {
	var _p1 = _p0;
	var _p5 = _p1.minY;
	var _p4 = _p1.minX;
	var _p3 = _p1.maxY;
	var _p2 = _p1.maxX;
	return ((_elm_lang$core$Native_Utils.cmp(_p4, _p2) < 1) && (_elm_lang$core$Native_Utils.cmp(_p5, _p3) < 1)) ? _opensolid$geometry$OpenSolid_Geometry_Internal$BoundingBox2d(_p1) : _opensolid$geometry$OpenSolid_Geometry_Internal$BoundingBox2d(
		{
			minX: A2(_elm_lang$core$Basics$min, _p4, _p2),
			maxX: A2(_elm_lang$core$Basics$max, _p4, _p2),
			minY: A2(_elm_lang$core$Basics$min, _p5, _p3),
			maxY: A2(_elm_lang$core$Basics$max, _p5, _p3)
		});
};

var _opensolid$geometry$OpenSolid_BoundingBox2d$extrema = function (_p0) {
	var _p1 = _p0;
	return _p1._0;
};
var _opensolid$geometry$OpenSolid_BoundingBox2d$minX = function (boundingBox) {
	return _opensolid$geometry$OpenSolid_BoundingBox2d$extrema(boundingBox).minX;
};
var _opensolid$geometry$OpenSolid_BoundingBox2d$maxX = function (boundingBox) {
	return _opensolid$geometry$OpenSolid_BoundingBox2d$extrema(boundingBox).maxX;
};
var _opensolid$geometry$OpenSolid_BoundingBox2d$minY = function (boundingBox) {
	return _opensolid$geometry$OpenSolid_BoundingBox2d$extrema(boundingBox).minY;
};
var _opensolid$geometry$OpenSolid_BoundingBox2d$maxY = function (boundingBox) {
	return _opensolid$geometry$OpenSolid_BoundingBox2d$extrema(boundingBox).maxY;
};
var _opensolid$geometry$OpenSolid_BoundingBox2d$overlaps = F2(
	function (other, boundingBox) {
		return (_elm_lang$core$Native_Utils.cmp(
			_opensolid$geometry$OpenSolid_BoundingBox2d$minX(boundingBox),
			_opensolid$geometry$OpenSolid_BoundingBox2d$maxX(other)) < 1) && ((_elm_lang$core$Native_Utils.cmp(
			_opensolid$geometry$OpenSolid_BoundingBox2d$maxX(boundingBox),
			_opensolid$geometry$OpenSolid_BoundingBox2d$minX(other)) > -1) && ((_elm_lang$core$Native_Utils.cmp(
			_opensolid$geometry$OpenSolid_BoundingBox2d$minY(boundingBox),
			_opensolid$geometry$OpenSolid_BoundingBox2d$maxY(other)) < 1) && (_elm_lang$core$Native_Utils.cmp(
			_opensolid$geometry$OpenSolid_BoundingBox2d$maxY(boundingBox),
			_opensolid$geometry$OpenSolid_BoundingBox2d$minY(other)) > -1)));
	});
var _opensolid$geometry$OpenSolid_BoundingBox2d$isContainedIn = F2(
	function (other, boundingBox) {
		return ((_elm_lang$core$Native_Utils.cmp(
			_opensolid$geometry$OpenSolid_BoundingBox2d$minX(other),
			_opensolid$geometry$OpenSolid_BoundingBox2d$minX(boundingBox)) < 1) && (_elm_lang$core$Native_Utils.cmp(
			_opensolid$geometry$OpenSolid_BoundingBox2d$maxX(boundingBox),
			_opensolid$geometry$OpenSolid_BoundingBox2d$maxX(other)) < 1)) && ((_elm_lang$core$Native_Utils.cmp(
			_opensolid$geometry$OpenSolid_BoundingBox2d$minY(other),
			_opensolid$geometry$OpenSolid_BoundingBox2d$minY(boundingBox)) < 1) && (_elm_lang$core$Native_Utils.cmp(
			_opensolid$geometry$OpenSolid_BoundingBox2d$maxY(boundingBox),
			_opensolid$geometry$OpenSolid_BoundingBox2d$maxY(other)) < 1));
	});
var _opensolid$geometry$OpenSolid_BoundingBox2d$dimensions = function (boundingBox) {
	var _p2 = _opensolid$geometry$OpenSolid_BoundingBox2d$extrema(boundingBox);
	var minX = _p2.minX;
	var maxX = _p2.maxX;
	var minY = _p2.minY;
	var maxY = _p2.maxY;
	return {ctor: '_Tuple2', _0: maxX - minX, _1: maxY - minY};
};
var _opensolid$geometry$OpenSolid_BoundingBox2d$midX = function (boundingBox) {
	var _p3 = _opensolid$geometry$OpenSolid_BoundingBox2d$extrema(boundingBox);
	var minX = _p3.minX;
	var maxX = _p3.maxX;
	return minX + (0.5 * (maxX - minX));
};
var _opensolid$geometry$OpenSolid_BoundingBox2d$midY = function (boundingBox) {
	var _p4 = _opensolid$geometry$OpenSolid_BoundingBox2d$extrema(boundingBox);
	var minY = _p4.minY;
	var maxY = _p4.maxY;
	return minY + (0.5 * (maxY - minY));
};
var _opensolid$geometry$OpenSolid_BoundingBox2d$centroid = function (boundingBox) {
	return _opensolid$geometry$OpenSolid_Bootstrap_Point2d$fromCoordinates(
		{
			ctor: '_Tuple2',
			_0: _opensolid$geometry$OpenSolid_BoundingBox2d$midX(boundingBox),
			_1: _opensolid$geometry$OpenSolid_BoundingBox2d$midY(boundingBox)
		});
};
var _opensolid$geometry$OpenSolid_BoundingBox2d$contains = F2(
	function (point, boundingBox) {
		var _p5 = _opensolid$geometry$OpenSolid_BoundingBox2d$extrema(boundingBox);
		var minX = _p5.minX;
		var maxX = _p5.maxX;
		var minY = _p5.minY;
		var maxY = _p5.maxY;
		var _p6 = _opensolid$geometry$OpenSolid_Bootstrap_Point2d$coordinates(point);
		var x = _p6._0;
		var y = _p6._1;
		return ((_elm_lang$core$Native_Utils.cmp(minX, x) < 1) && (_elm_lang$core$Native_Utils.cmp(x, maxX) < 1)) && ((_elm_lang$core$Native_Utils.cmp(minY, y) < 1) && (_elm_lang$core$Native_Utils.cmp(y, maxY) < 1));
	});
var _opensolid$geometry$OpenSolid_BoundingBox2d$with = _opensolid$geometry$OpenSolid_Bootstrap_BoundingBox2d$with;
var _opensolid$geometry$OpenSolid_BoundingBox2d$singleton = function (point) {
	var _p7 = _opensolid$geometry$OpenSolid_Bootstrap_Point2d$coordinates(point);
	var x = _p7._0;
	var y = _p7._1;
	return _opensolid$geometry$OpenSolid_BoundingBox2d$with(
		{minX: x, maxX: x, minY: y, maxY: y});
};
var _opensolid$geometry$OpenSolid_BoundingBox2d$hull = F2(
	function (firstBox, secondBox) {
		return _opensolid$geometry$OpenSolid_BoundingBox2d$with(
			{
				minX: A2(
					_elm_lang$core$Basics$min,
					_opensolid$geometry$OpenSolid_BoundingBox2d$minX(firstBox),
					_opensolid$geometry$OpenSolid_BoundingBox2d$minX(secondBox)),
				maxX: A2(
					_elm_lang$core$Basics$max,
					_opensolid$geometry$OpenSolid_BoundingBox2d$maxX(firstBox),
					_opensolid$geometry$OpenSolid_BoundingBox2d$maxX(secondBox)),
				minY: A2(
					_elm_lang$core$Basics$min,
					_opensolid$geometry$OpenSolid_BoundingBox2d$minY(firstBox),
					_opensolid$geometry$OpenSolid_BoundingBox2d$minY(secondBox)),
				maxY: A2(
					_elm_lang$core$Basics$max,
					_opensolid$geometry$OpenSolid_BoundingBox2d$maxY(firstBox),
					_opensolid$geometry$OpenSolid_BoundingBox2d$maxY(secondBox))
			});
	});
var _opensolid$geometry$OpenSolid_BoundingBox2d$hullOf = function (boundingBoxes) {
	var _p8 = boundingBoxes;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _opensolid$geometry$OpenSolid_BoundingBox2d$hull, _p8._0, _p8._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _opensolid$geometry$OpenSolid_BoundingBox2d$intersection = F2(
	function (firstBox, secondBox) {
		return A2(_opensolid$geometry$OpenSolid_BoundingBox2d$overlaps, firstBox, secondBox) ? _elm_lang$core$Maybe$Just(
			_opensolid$geometry$OpenSolid_BoundingBox2d$with(
				{
					minX: A2(
						_elm_lang$core$Basics$max,
						_opensolid$geometry$OpenSolid_BoundingBox2d$minX(firstBox),
						_opensolid$geometry$OpenSolid_BoundingBox2d$minX(secondBox)),
					maxX: A2(
						_elm_lang$core$Basics$min,
						_opensolid$geometry$OpenSolid_BoundingBox2d$maxX(firstBox),
						_opensolid$geometry$OpenSolid_BoundingBox2d$maxX(secondBox)),
					minY: A2(
						_elm_lang$core$Basics$max,
						_opensolid$geometry$OpenSolid_BoundingBox2d$minY(firstBox),
						_opensolid$geometry$OpenSolid_BoundingBox2d$minY(secondBox)),
					maxY: A2(
						_elm_lang$core$Basics$min,
						_opensolid$geometry$OpenSolid_BoundingBox2d$maxY(firstBox),
						_opensolid$geometry$OpenSolid_BoundingBox2d$maxY(secondBox))
				})) : _elm_lang$core$Maybe$Nothing;
	});

var _opensolid$geometry$OpenSolid_Point2d$hullOf = function (points) {
	return _opensolid$geometry$OpenSolid_BoundingBox2d$hullOf(
		A2(_elm_lang$core$List$map, _opensolid$geometry$OpenSolid_BoundingBox2d$singleton, points));
};
var _opensolid$geometry$OpenSolid_Point2d$signedDistanceFrom = F2(
	function (axis, point) {
		var displacementVector = A2(
			_opensolid$geometry$OpenSolid_Vector2d$from,
			_opensolid$geometry$OpenSolid_Bootstrap_Axis2d$originPoint(axis),
			point);
		var directionVector = _opensolid$geometry$OpenSolid_Direction2d$toVector(
			_opensolid$geometry$OpenSolid_Bootstrap_Axis2d$direction(axis));
		return A2(_opensolid$geometry$OpenSolid_Vector2d$crossProduct, directionVector, displacementVector);
	});
var _opensolid$geometry$OpenSolid_Point2d$distanceAlong = F2(
	function (axis, point) {
		return A2(
			_opensolid$geometry$OpenSolid_Vector2d$componentIn,
			_opensolid$geometry$OpenSolid_Bootstrap_Axis2d$direction(axis),
			A2(
				_opensolid$geometry$OpenSolid_Vector2d$from,
				_opensolid$geometry$OpenSolid_Bootstrap_Axis2d$originPoint(axis),
				point));
	});
var _opensolid$geometry$OpenSolid_Point2d$squaredDistanceFrom = F2(
	function (firstPoint, secondPoint) {
		return _opensolid$geometry$OpenSolid_Vector2d$squaredLength(
			A2(_opensolid$geometry$OpenSolid_Vector2d$from, firstPoint, secondPoint));
	});
var _opensolid$geometry$OpenSolid_Point2d$distanceFrom = F2(
	function (firstPoint, secondPoint) {
		return _elm_lang$core$Basics$sqrt(
			A2(_opensolid$geometry$OpenSolid_Point2d$squaredDistanceFrom, firstPoint, secondPoint));
	});
var _opensolid$geometry$OpenSolid_Point2d$equalWithin = F3(
	function (tolerance, firstPoint, secondPoint) {
		return _elm_lang$core$Native_Utils.cmp(
			A2(_opensolid$geometry$OpenSolid_Point2d$squaredDistanceFrom, firstPoint, secondPoint),
			tolerance * tolerance) < 1;
	});
var _opensolid$geometry$OpenSolid_Point2d$yCoordinate = function (_p0) {
	var _p1 = _p0;
	return _p1._0._1;
};
var _opensolid$geometry$OpenSolid_Point2d$xCoordinate = function (_p2) {
	var _p3 = _p2;
	return _p3._0._0;
};
var _opensolid$geometry$OpenSolid_Point2d$coordinates = function (_p4) {
	var _p5 = _p4;
	return _p5._0;
};
var _opensolid$geometry$OpenSolid_Point2d$polarCoordinates = function (point) {
	return _elm_lang$core$Basics$toPolar(
		_opensolid$geometry$OpenSolid_Point2d$coordinates(point));
};
var _opensolid$geometry$OpenSolid_Point2d$hull = F2(
	function (firstPoint, secondPoint) {
		var _p6 = _opensolid$geometry$OpenSolid_Point2d$coordinates(secondPoint);
		var x2 = _p6._0;
		var y2 = _p6._1;
		var _p7 = _opensolid$geometry$OpenSolid_Point2d$coordinates(firstPoint);
		var x1 = _p7._0;
		var y1 = _p7._1;
		return _opensolid$geometry$OpenSolid_BoundingBox2d$with(
			{
				minX: A2(_elm_lang$core$Basics$min, x1, x2),
				maxX: A2(_elm_lang$core$Basics$max, x1, x2),
				minY: A2(_elm_lang$core$Basics$min, y1, y2),
				maxY: A2(_elm_lang$core$Basics$max, y1, y2)
			});
	});
var _opensolid$geometry$OpenSolid_Point2d$fromCoordinates = _opensolid$geometry$OpenSolid_Geometry_Internal$Point2d;
var _opensolid$geometry$OpenSolid_Point2d$fromPolarCoordinates = function (coordinates) {
	return _opensolid$geometry$OpenSolid_Point2d$fromCoordinates(
		_elm_lang$core$Basics$fromPolar(coordinates));
};
var _opensolid$geometry$OpenSolid_Point2d$interpolateFrom = F3(
	function (p1, p2, t) {
		var _p8 = _opensolid$geometry$OpenSolid_Point2d$coordinates(p2);
		var x2 = _p8._0;
		var y2 = _p8._1;
		var _p9 = _opensolid$geometry$OpenSolid_Point2d$coordinates(p1);
		var x1 = _p9._0;
		var y1 = _p9._1;
		return _opensolid$geometry$OpenSolid_Point2d$fromCoordinates(
			{
				ctor: '_Tuple2',
				_0: A3(_opensolid$geometry$OpenSolid_Scalar$interpolateFrom, x1, x2, t),
				_1: A3(_opensolid$geometry$OpenSolid_Scalar$interpolateFrom, y1, y2, t)
			});
	});
var _opensolid$geometry$OpenSolid_Point2d$midpoint = F2(
	function (firstPoint, secondPoint) {
		return A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, firstPoint, secondPoint, 0.5);
	});
var _opensolid$geometry$OpenSolid_Point2d$circumcenter = function (_p10) {
	var _p11 = _p10;
	var _p17 = _p11._2;
	var _p16 = _p11._1;
	var _p15 = _p11._0;
	var c2 = A2(_opensolid$geometry$OpenSolid_Point2d$squaredDistanceFrom, _p17, _p15);
	var b2 = A2(_opensolid$geometry$OpenSolid_Point2d$squaredDistanceFrom, _p16, _p17);
	var a2 = A2(_opensolid$geometry$OpenSolid_Point2d$squaredDistanceFrom, _p15, _p16);
	var t1 = a2 * ((b2 + c2) - a2);
	var t2 = b2 * ((c2 + a2) - b2);
	var t3 = c2 * ((a2 + b2) - c2);
	var sum = (t1 + t2) + t3;
	if (_elm_lang$core$Native_Utils.eq(sum, 0)) {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		var _p12 = _opensolid$geometry$OpenSolid_Point2d$coordinates(_p17);
		var x3 = _p12._0;
		var y3 = _p12._1;
		var _p13 = _opensolid$geometry$OpenSolid_Point2d$coordinates(_p16);
		var x2 = _p13._0;
		var y2 = _p13._1;
		var _p14 = _opensolid$geometry$OpenSolid_Point2d$coordinates(_p15);
		var x1 = _p14._0;
		var y1 = _p14._1;
		var w3 = t3 / sum;
		var w2 = t2 / sum;
		var w1 = t1 / sum;
		return _elm_lang$core$Maybe$Just(
			_opensolid$geometry$OpenSolid_Point2d$fromCoordinates(
				{ctor: '_Tuple2', _0: ((w1 * x3) + (w2 * x1)) + (w3 * x2), _1: ((w1 * y3) + (w2 * y1)) + (w3 * y2)}));
	}
};
var _opensolid$geometry$OpenSolid_Point2d$translateBy = F2(
	function (vector, point) {
		var _p18 = _opensolid$geometry$OpenSolid_Point2d$coordinates(point);
		var px = _p18._0;
		var py = _p18._1;
		var _p19 = _opensolid$geometry$OpenSolid_Vector2d$components(vector);
		var vx = _p19._0;
		var vy = _p19._1;
		return _opensolid$geometry$OpenSolid_Point2d$fromCoordinates(
			{ctor: '_Tuple2', _0: px + vx, _1: py + vy});
	});
var _opensolid$geometry$OpenSolid_Point2d$along = F2(
	function (axis, distance) {
		return A2(
			_opensolid$geometry$OpenSolid_Point2d$translateBy,
			_opensolid$geometry$OpenSolid_Vector2d$with(
				{
					length: distance,
					direction: _opensolid$geometry$OpenSolid_Bootstrap_Axis2d$direction(axis)
				}),
			_opensolid$geometry$OpenSolid_Bootstrap_Axis2d$originPoint(axis));
	});
var _opensolid$geometry$OpenSolid_Point2d$relativeTo = F2(
	function (frame, point) {
		return _opensolid$geometry$OpenSolid_Point2d$fromCoordinates(
			_opensolid$geometry$OpenSolid_Vector2d$components(
				A2(
					_opensolid$geometry$OpenSolid_Vector2d$relativeTo,
					frame,
					A2(
						_opensolid$geometry$OpenSolid_Vector2d$from,
						_opensolid$geometry$OpenSolid_Bootstrap_Frame2d$originPoint(frame),
						point))));
	});
var _opensolid$geometry$OpenSolid_Point2d$origin = _opensolid$geometry$OpenSolid_Point2d$fromCoordinates(
	{ctor: '_Tuple2', _0: 0, _1: 0});
var _opensolid$geometry$OpenSolid_Point2d$addTo = F2(
	function (point, vector) {
		return A2(_opensolid$geometry$OpenSolid_Point2d$translateBy, vector, point);
	});
var _opensolid$geometry$OpenSolid_Point2d$scaleAbout = F3(
	function (centerPoint, scale, point) {
		return A2(
			_opensolid$geometry$OpenSolid_Point2d$addTo,
			centerPoint,
			A2(
				_opensolid$geometry$OpenSolid_Vector2d$scaleBy,
				scale,
				A2(_opensolid$geometry$OpenSolid_Vector2d$from, centerPoint, point)));
	});
var _opensolid$geometry$OpenSolid_Point2d$rotateAround = F2(
	function (centerPoint, angle) {
		return function (_p20) {
			return A2(
				_opensolid$geometry$OpenSolid_Point2d$addTo,
				centerPoint,
				A2(
					_opensolid$geometry$OpenSolid_Vector2d$rotateBy,
					angle,
					A2(_opensolid$geometry$OpenSolid_Vector2d$from, centerPoint, _p20)));
		};
	});
var _opensolid$geometry$OpenSolid_Point2d$mirrorAcross = function (axis) {
	return function (_p21) {
		return A2(
			_opensolid$geometry$OpenSolid_Point2d$addTo,
			_opensolid$geometry$OpenSolid_Bootstrap_Axis2d$originPoint(axis),
			A2(
				_opensolid$geometry$OpenSolid_Vector2d$mirrorAcross,
				axis,
				A2(
					_opensolid$geometry$OpenSolid_Vector2d$from,
					_opensolid$geometry$OpenSolid_Bootstrap_Axis2d$originPoint(axis),
					_p21)));
	};
};
var _opensolid$geometry$OpenSolid_Point2d$projectOnto = function (axis) {
	return function (_p22) {
		return A2(
			_opensolid$geometry$OpenSolid_Point2d$addTo,
			_opensolid$geometry$OpenSolid_Bootstrap_Axis2d$originPoint(axis),
			A2(
				_opensolid$geometry$OpenSolid_Vector2d$projectOnto,
				axis,
				A2(
					_opensolid$geometry$OpenSolid_Vector2d$from,
					_opensolid$geometry$OpenSolid_Bootstrap_Axis2d$originPoint(axis),
					_p22)));
	};
};
var _opensolid$geometry$OpenSolid_Point2d$placeIn = F2(
	function (frame, point) {
		return A2(
			_opensolid$geometry$OpenSolid_Point2d$addTo,
			_opensolid$geometry$OpenSolid_Bootstrap_Frame2d$originPoint(frame),
			A2(
				_opensolid$geometry$OpenSolid_Vector2d$placeIn,
				frame,
				_opensolid$geometry$OpenSolid_Vector2d$fromComponents(
					_opensolid$geometry$OpenSolid_Point2d$coordinates(point))));
	});
var _opensolid$geometry$OpenSolid_Point2d$in_ = F2(
	function (frame, coordinates) {
		return A2(
			_opensolid$geometry$OpenSolid_Point2d$placeIn,
			frame,
			_opensolid$geometry$OpenSolid_Point2d$fromCoordinates(coordinates));
	});

var _opensolid$geometry$OpenSolid_Axis2d$direction = function (_p0) {
	var _p1 = _p0;
	return _p1._0.direction;
};
var _opensolid$geometry$OpenSolid_Axis2d$originPoint = function (_p2) {
	var _p3 = _p2;
	return _p3._0.originPoint;
};
var _opensolid$geometry$OpenSolid_Axis2d$with = _opensolid$geometry$OpenSolid_Geometry_Internal$Axis2d;
var _opensolid$geometry$OpenSolid_Axis2d$flip = function (axis) {
	return _opensolid$geometry$OpenSolid_Axis2d$with(
		{
			originPoint: _opensolid$geometry$OpenSolid_Axis2d$originPoint(axis),
			direction: _opensolid$geometry$OpenSolid_Direction2d$flip(
				_opensolid$geometry$OpenSolid_Axis2d$direction(axis))
		});
};
var _opensolid$geometry$OpenSolid_Axis2d$moveTo = F2(
	function (newOrigin, axis) {
		return _opensolid$geometry$OpenSolid_Axis2d$with(
			{
				originPoint: newOrigin,
				direction: _opensolid$geometry$OpenSolid_Axis2d$direction(axis)
			});
	});
var _opensolid$geometry$OpenSolid_Axis2d$rotateAround = F2(
	function (centerPoint, angle) {
		var rotateDirection = _opensolid$geometry$OpenSolid_Direction2d$rotateBy(angle);
		var rotatePoint = A2(_opensolid$geometry$OpenSolid_Point2d$rotateAround, centerPoint, angle);
		return function (axis) {
			return _opensolid$geometry$OpenSolid_Axis2d$with(
				{
					originPoint: rotatePoint(
						_opensolid$geometry$OpenSolid_Axis2d$originPoint(axis)),
					direction: rotateDirection(
						_opensolid$geometry$OpenSolid_Axis2d$direction(axis))
				});
		};
	});
var _opensolid$geometry$OpenSolid_Axis2d$translateBy = F2(
	function (vector, axis) {
		return _opensolid$geometry$OpenSolid_Axis2d$with(
			{
				originPoint: A2(
					_opensolid$geometry$OpenSolid_Point2d$translateBy,
					vector,
					_opensolid$geometry$OpenSolid_Axis2d$originPoint(axis)),
				direction: _opensolid$geometry$OpenSolid_Axis2d$direction(axis)
			});
	});
var _opensolid$geometry$OpenSolid_Axis2d$mirrorAcross = function (otherAxis) {
	var mirrorDirection = _opensolid$geometry$OpenSolid_Direction2d$mirrorAcross(otherAxis);
	var mirrorPoint = _opensolid$geometry$OpenSolid_Point2d$mirrorAcross(otherAxis);
	return function (axis) {
		return _opensolid$geometry$OpenSolid_Axis2d$with(
			{
				originPoint: mirrorPoint(
					_opensolid$geometry$OpenSolid_Axis2d$originPoint(axis)),
				direction: mirrorDirection(
					_opensolid$geometry$OpenSolid_Axis2d$direction(axis))
			});
	};
};
var _opensolid$geometry$OpenSolid_Axis2d$relativeTo = function (frame) {
	var relativeDirection = _opensolid$geometry$OpenSolid_Direction2d$relativeTo(frame);
	var relativePoint = _opensolid$geometry$OpenSolid_Point2d$relativeTo(frame);
	return function (axis) {
		return _opensolid$geometry$OpenSolid_Axis2d$with(
			{
				originPoint: relativePoint(
					_opensolid$geometry$OpenSolid_Axis2d$originPoint(axis)),
				direction: relativeDirection(
					_opensolid$geometry$OpenSolid_Axis2d$direction(axis))
			});
	};
};
var _opensolid$geometry$OpenSolid_Axis2d$placeIn = function (frame) {
	var placeDirection = _opensolid$geometry$OpenSolid_Direction2d$placeIn(frame);
	var placePoint = _opensolid$geometry$OpenSolid_Point2d$placeIn(frame);
	return function (axis) {
		return _opensolid$geometry$OpenSolid_Axis2d$with(
			{
				originPoint: placePoint(
					_opensolid$geometry$OpenSolid_Axis2d$originPoint(axis)),
				direction: placeDirection(
					_opensolid$geometry$OpenSolid_Axis2d$direction(axis))
			});
	};
};
var _opensolid$geometry$OpenSolid_Axis2d$y = _opensolid$geometry$OpenSolid_Axis2d$with(
	{originPoint: _opensolid$geometry$OpenSolid_Point2d$origin, direction: _opensolid$geometry$OpenSolid_Direction2d$y});
var _opensolid$geometry$OpenSolid_Axis2d$x = _opensolid$geometry$OpenSolid_Axis2d$with(
	{originPoint: _opensolid$geometry$OpenSolid_Point2d$origin, direction: _opensolid$geometry$OpenSolid_Direction2d$x});

var _opensolid$geometry$OpenSolid_Frame2d$yDirection = function (_p0) {
	var _p1 = _p0;
	return _p1._0.yDirection;
};
var _opensolid$geometry$OpenSolid_Frame2d$xDirection = function (_p2) {
	var _p3 = _p2;
	return _p3._0.xDirection;
};
var _opensolid$geometry$OpenSolid_Frame2d$isRightHanded = function (frame) {
	var yVector = _opensolid$geometry$OpenSolid_Direction2d$toVector(
		_opensolid$geometry$OpenSolid_Frame2d$yDirection(frame));
	var xVector = _opensolid$geometry$OpenSolid_Direction2d$toVector(
		_opensolid$geometry$OpenSolid_Frame2d$xDirection(frame));
	return _elm_lang$core$Native_Utils.cmp(
		A2(_opensolid$geometry$OpenSolid_Vector2d$crossProduct, xVector, yVector),
		0) > 0;
};
var _opensolid$geometry$OpenSolid_Frame2d$originPoint = function (_p4) {
	var _p5 = _p4;
	return _p5._0.originPoint;
};
var _opensolid$geometry$OpenSolid_Frame2d$xAxis = function (frame) {
	return _opensolid$geometry$OpenSolid_Axis2d$with(
		{
			originPoint: _opensolid$geometry$OpenSolid_Frame2d$originPoint(frame),
			direction: _opensolid$geometry$OpenSolid_Frame2d$xDirection(frame)
		});
};
var _opensolid$geometry$OpenSolid_Frame2d$yAxis = function (frame) {
	return _opensolid$geometry$OpenSolid_Axis2d$with(
		{
			originPoint: _opensolid$geometry$OpenSolid_Frame2d$originPoint(frame),
			direction: _opensolid$geometry$OpenSolid_Frame2d$yDirection(frame)
		});
};
var _opensolid$geometry$OpenSolid_Frame2d$unsafe = _opensolid$geometry$OpenSolid_Geometry_Internal$Frame2d;
var _opensolid$geometry$OpenSolid_Frame2d$atPoint = function (point) {
	return _opensolid$geometry$OpenSolid_Frame2d$unsafe(
		{originPoint: point, xDirection: _opensolid$geometry$OpenSolid_Direction2d$x, yDirection: _opensolid$geometry$OpenSolid_Direction2d$y});
};
var _opensolid$geometry$OpenSolid_Frame2d$flipX = function (frame) {
	return _opensolid$geometry$OpenSolid_Frame2d$unsafe(
		{
			originPoint: _opensolid$geometry$OpenSolid_Frame2d$originPoint(frame),
			xDirection: _opensolid$geometry$OpenSolid_Direction2d$flip(
				_opensolid$geometry$OpenSolid_Frame2d$xDirection(frame)),
			yDirection: _opensolid$geometry$OpenSolid_Frame2d$yDirection(frame)
		});
};
var _opensolid$geometry$OpenSolid_Frame2d$flipY = function (frame) {
	return _opensolid$geometry$OpenSolid_Frame2d$unsafe(
		{
			originPoint: _opensolid$geometry$OpenSolid_Frame2d$originPoint(frame),
			xDirection: _opensolid$geometry$OpenSolid_Frame2d$xDirection(frame),
			yDirection: _opensolid$geometry$OpenSolid_Direction2d$flip(
				_opensolid$geometry$OpenSolid_Frame2d$yDirection(frame))
		});
};
var _opensolid$geometry$OpenSolid_Frame2d$moveTo = F2(
	function (newOrigin, frame) {
		return _opensolid$geometry$OpenSolid_Frame2d$unsafe(
			{
				originPoint: newOrigin,
				xDirection: _opensolid$geometry$OpenSolid_Frame2d$xDirection(frame),
				yDirection: _opensolid$geometry$OpenSolid_Frame2d$yDirection(frame)
			});
	});
var _opensolid$geometry$OpenSolid_Frame2d$rotateBy = F2(
	function (angle, frame) {
		var rotateDirection = _opensolid$geometry$OpenSolid_Direction2d$rotateBy(angle);
		return _opensolid$geometry$OpenSolid_Frame2d$unsafe(
			{
				originPoint: _opensolid$geometry$OpenSolid_Frame2d$originPoint(frame),
				xDirection: rotateDirection(
					_opensolid$geometry$OpenSolid_Frame2d$xDirection(frame)),
				yDirection: rotateDirection(
					_opensolid$geometry$OpenSolid_Frame2d$yDirection(frame))
			});
	});
var _opensolid$geometry$OpenSolid_Frame2d$rotateAround = F2(
	function (centerPoint, angle) {
		var rotateDirection = _opensolid$geometry$OpenSolid_Direction2d$rotateBy(angle);
		var rotatePoint = A2(_opensolid$geometry$OpenSolid_Point2d$rotateAround, centerPoint, angle);
		return function (frame) {
			return _opensolid$geometry$OpenSolid_Frame2d$unsafe(
				{
					originPoint: rotatePoint(
						_opensolid$geometry$OpenSolid_Frame2d$originPoint(frame)),
					xDirection: rotateDirection(
						_opensolid$geometry$OpenSolid_Frame2d$xDirection(frame)),
					yDirection: rotateDirection(
						_opensolid$geometry$OpenSolid_Frame2d$yDirection(frame))
				});
		};
	});
var _opensolid$geometry$OpenSolid_Frame2d$translateBy = F2(
	function (vector, frame) {
		return _opensolid$geometry$OpenSolid_Frame2d$unsafe(
			{
				originPoint: A2(
					_opensolid$geometry$OpenSolid_Point2d$translateBy,
					vector,
					_opensolid$geometry$OpenSolid_Frame2d$originPoint(frame)),
				xDirection: _opensolid$geometry$OpenSolid_Frame2d$xDirection(frame),
				yDirection: _opensolid$geometry$OpenSolid_Frame2d$yDirection(frame)
			});
	});
var _opensolid$geometry$OpenSolid_Frame2d$translateAlongOwn = F3(
	function (axis, distance, frame) {
		var displacement = _opensolid$geometry$OpenSolid_Vector2d$with(
			{
				length: distance,
				direction: _opensolid$geometry$OpenSolid_Axis2d$direction(
					axis(frame))
			});
		return A2(_opensolid$geometry$OpenSolid_Frame2d$translateBy, displacement, frame);
	});
var _opensolid$geometry$OpenSolid_Frame2d$mirrorAcross = function (axis) {
	var mirrorDirection = _opensolid$geometry$OpenSolid_Direction2d$mirrorAcross(axis);
	var mirrorPoint = _opensolid$geometry$OpenSolid_Point2d$mirrorAcross(axis);
	return function (frame) {
		return _opensolid$geometry$OpenSolid_Frame2d$unsafe(
			{
				originPoint: mirrorPoint(
					_opensolid$geometry$OpenSolid_Frame2d$originPoint(frame)),
				xDirection: mirrorDirection(
					_opensolid$geometry$OpenSolid_Frame2d$xDirection(frame)),
				yDirection: mirrorDirection(
					_opensolid$geometry$OpenSolid_Frame2d$yDirection(frame))
			});
	};
};
var _opensolid$geometry$OpenSolid_Frame2d$relativeTo = function (otherFrame) {
	var relativeDirection = _opensolid$geometry$OpenSolid_Direction2d$relativeTo(otherFrame);
	var relativePoint = _opensolid$geometry$OpenSolid_Point2d$relativeTo(otherFrame);
	return function (frame) {
		return _opensolid$geometry$OpenSolid_Frame2d$unsafe(
			{
				originPoint: relativePoint(
					_opensolid$geometry$OpenSolid_Frame2d$originPoint(frame)),
				xDirection: relativeDirection(
					_opensolid$geometry$OpenSolid_Frame2d$xDirection(frame)),
				yDirection: relativeDirection(
					_opensolid$geometry$OpenSolid_Frame2d$yDirection(frame))
			});
	};
};
var _opensolid$geometry$OpenSolid_Frame2d$placeIn = function (otherFrame) {
	var placeDirection = _opensolid$geometry$OpenSolid_Direction2d$placeIn(otherFrame);
	var placePoint = _opensolid$geometry$OpenSolid_Point2d$placeIn(otherFrame);
	return function (frame) {
		return _opensolid$geometry$OpenSolid_Frame2d$unsafe(
			{
				originPoint: placePoint(
					_opensolid$geometry$OpenSolid_Frame2d$originPoint(frame)),
				xDirection: placeDirection(
					_opensolid$geometry$OpenSolid_Frame2d$xDirection(frame)),
				yDirection: placeDirection(
					_opensolid$geometry$OpenSolid_Frame2d$yDirection(frame))
			});
	};
};
var _opensolid$geometry$OpenSolid_Frame2d$with = function (_p6) {
	var _p7 = _p6;
	var _p8 = _p7.xDirection;
	return _opensolid$geometry$OpenSolid_Frame2d$unsafe(
		{
			originPoint: _p7.originPoint,
			xDirection: _p8,
			yDirection: _opensolid$geometry$OpenSolid_Direction2d$perpendicularTo(_p8)
		});
};
var _opensolid$geometry$OpenSolid_Frame2d$xy = _opensolid$geometry$OpenSolid_Frame2d$atPoint(_opensolid$geometry$OpenSolid_Point2d$origin);

var _opensolid$geometry$OpenSolid_CubicSpline2d$endPoint = function (_p0) {
	var _p1 = _p0;
	return _p1._0._3;
};
var _opensolid$geometry$OpenSolid_CubicSpline2d$startPoint = function (_p2) {
	var _p3 = _p2;
	return _p3._0._0;
};
var _opensolid$geometry$OpenSolid_CubicSpline2d$controlPoints = function (_p4) {
	var _p5 = _p4;
	return _p5._0;
};
var _opensolid$geometry$OpenSolid_CubicSpline2d$startDerivative = function (spline) {
	var _p6 = _opensolid$geometry$OpenSolid_CubicSpline2d$controlPoints(spline);
	var p1 = _p6._0;
	var p2 = _p6._1;
	return A2(
		_opensolid$geometry$OpenSolid_Vector2d$scaleBy,
		3,
		A2(_opensolid$geometry$OpenSolid_Vector2d$from, p1, p2));
};
var _opensolid$geometry$OpenSolid_CubicSpline2d$endDerivative = function (spline) {
	var _p7 = _opensolid$geometry$OpenSolid_CubicSpline2d$controlPoints(spline);
	var p3 = _p7._2;
	var p4 = _p7._3;
	return A2(
		_opensolid$geometry$OpenSolid_Vector2d$scaleBy,
		3,
		A2(_opensolid$geometry$OpenSolid_Vector2d$from, p3, p4));
};
var _opensolid$geometry$OpenSolid_CubicSpline2d$pointOn = F2(
	function (spline, t) {
		var _p8 = _opensolid$geometry$OpenSolid_CubicSpline2d$controlPoints(spline);
		var p1 = _p8._0;
		var p2 = _p8._1;
		var p3 = _p8._2;
		var p4 = _p8._3;
		var q1 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, p1, p2, t);
		var q2 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, p2, p3, t);
		var r1 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, q1, q2, t);
		var q3 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, p3, p4, t);
		var r2 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, q2, q3, t);
		return A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, r1, r2, t);
	});
var _opensolid$geometry$OpenSolid_CubicSpline2d$derivative = function (spline) {
	var _p9 = _opensolid$geometry$OpenSolid_CubicSpline2d$controlPoints(spline);
	var p1 = _p9._0;
	var p2 = _p9._1;
	var p3 = _p9._2;
	var p4 = _p9._3;
	var v1 = A2(_opensolid$geometry$OpenSolid_Vector2d$from, p1, p2);
	var v2 = A2(_opensolid$geometry$OpenSolid_Vector2d$from, p2, p3);
	var v3 = A2(_opensolid$geometry$OpenSolid_Vector2d$from, p3, p4);
	return function (t) {
		var w2 = A3(_opensolid$geometry$OpenSolid_Vector2d$interpolateFrom, v2, v3, t);
		var w1 = A3(_opensolid$geometry$OpenSolid_Vector2d$interpolateFrom, v1, v2, t);
		return A2(
			_opensolid$geometry$OpenSolid_Vector2d$scaleBy,
			3,
			A3(_opensolid$geometry$OpenSolid_Vector2d$interpolateFrom, w1, w2, t));
	};
};
var _opensolid$geometry$OpenSolid_CubicSpline2d$evaluate = F2(
	function (spline, t) {
		var _p10 = _opensolid$geometry$OpenSolid_CubicSpline2d$controlPoints(spline);
		var p1 = _p10._0;
		var p2 = _p10._1;
		var p3 = _p10._2;
		var p4 = _p10._3;
		var q1 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, p1, p2, t);
		var q2 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, p2, p3, t);
		var r1 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, q1, q2, t);
		var q3 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, p3, p4, t);
		var r2 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, q2, q3, t);
		return {
			ctor: '_Tuple2',
			_0: A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, r1, r2, t),
			_1: A2(
				_opensolid$geometry$OpenSolid_Vector2d$scaleBy,
				3,
				A2(_opensolid$geometry$OpenSolid_Vector2d$from, r1, r2))
		};
	});
var _opensolid$geometry$OpenSolid_CubicSpline2d$fromControlPoints = _opensolid$geometry$OpenSolid_Geometry_Internal$CubicSpline2d;
var _opensolid$geometry$OpenSolid_CubicSpline2d$hermite = F2(
	function (_p12, _p11) {
		var _p13 = _p12;
		var _p16 = _p13._0;
		var _p14 = _p11;
		var _p15 = _p14._0;
		var endControlPoint = A2(
			_opensolid$geometry$OpenSolid_Point2d$translateBy,
			A2(_opensolid$geometry$OpenSolid_Vector2d$scaleBy, -1 / 3, _p14._1),
			_p15);
		var startControlPoint = A2(
			_opensolid$geometry$OpenSolid_Point2d$translateBy,
			A2(_opensolid$geometry$OpenSolid_Vector2d$scaleBy, 1 / 3, _p13._1),
			_p16);
		return _opensolid$geometry$OpenSolid_CubicSpline2d$fromControlPoints(
			{ctor: '_Tuple4', _0: _p16, _1: startControlPoint, _2: endControlPoint, _3: _p15});
	});
var _opensolid$geometry$OpenSolid_CubicSpline2d$mapControlPoints = F2(
	function ($function, spline) {
		var _p17 = _opensolid$geometry$OpenSolid_CubicSpline2d$controlPoints(spline);
		var p1 = _p17._0;
		var p2 = _p17._1;
		var p3 = _p17._2;
		var p4 = _p17._3;
		return _opensolid$geometry$OpenSolid_CubicSpline2d$fromControlPoints(
			{
				ctor: '_Tuple4',
				_0: $function(p1),
				_1: $function(p2),
				_2: $function(p3),
				_3: $function(p4)
			});
	});
var _opensolid$geometry$OpenSolid_CubicSpline2d$scaleAbout = F2(
	function (point, scale) {
		return _opensolid$geometry$OpenSolid_CubicSpline2d$mapControlPoints(
			A2(_opensolid$geometry$OpenSolid_Point2d$scaleAbout, point, scale));
	});
var _opensolid$geometry$OpenSolid_CubicSpline2d$rotateAround = F2(
	function (point, angle) {
		return _opensolid$geometry$OpenSolid_CubicSpline2d$mapControlPoints(
			A2(_opensolid$geometry$OpenSolid_Point2d$rotateAround, point, angle));
	});
var _opensolid$geometry$OpenSolid_CubicSpline2d$translateBy = function (displacement) {
	return _opensolid$geometry$OpenSolid_CubicSpline2d$mapControlPoints(
		_opensolid$geometry$OpenSolid_Point2d$translateBy(displacement));
};
var _opensolid$geometry$OpenSolid_CubicSpline2d$mirrorAcross = function (axis) {
	return _opensolid$geometry$OpenSolid_CubicSpline2d$mapControlPoints(
		_opensolid$geometry$OpenSolid_Point2d$mirrorAcross(axis));
};
var _opensolid$geometry$OpenSolid_CubicSpline2d$relativeTo = function (frame) {
	return _opensolid$geometry$OpenSolid_CubicSpline2d$mapControlPoints(
		_opensolid$geometry$OpenSolid_Point2d$relativeTo(frame));
};
var _opensolid$geometry$OpenSolid_CubicSpline2d$placeIn = function (frame) {
	return _opensolid$geometry$OpenSolid_CubicSpline2d$mapControlPoints(
		_opensolid$geometry$OpenSolid_Point2d$placeIn(frame));
};
var _opensolid$geometry$OpenSolid_CubicSpline2d$reverse = function (spline) {
	var _p18 = _opensolid$geometry$OpenSolid_CubicSpline2d$controlPoints(spline);
	var p1 = _p18._0;
	var p2 = _p18._1;
	var p3 = _p18._2;
	var p4 = _p18._3;
	return _opensolid$geometry$OpenSolid_CubicSpline2d$fromControlPoints(
		{ctor: '_Tuple4', _0: p4, _1: p3, _2: p2, _3: p1});
};
var _opensolid$geometry$OpenSolid_CubicSpline2d$splitAt = F2(
	function (t, spline) {
		var _p19 = _opensolid$geometry$OpenSolid_CubicSpline2d$controlPoints(spline);
		var p1 = _p19._0;
		var p2 = _p19._1;
		var p3 = _p19._2;
		var p4 = _p19._3;
		var q1 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, p1, p2, t);
		var q2 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, p2, p3, t);
		var r1 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, q1, q2, t);
		var q3 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, p3, p4, t);
		var r2 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, q2, q3, t);
		var s = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, r1, r2, t);
		return {
			ctor: '_Tuple2',
			_0: _opensolid$geometry$OpenSolid_CubicSpline2d$fromControlPoints(
				{ctor: '_Tuple4', _0: p1, _1: q1, _2: r1, _3: s}),
			_1: _opensolid$geometry$OpenSolid_CubicSpline2d$fromControlPoints(
				{ctor: '_Tuple4', _0: s, _1: r2, _2: q3, _3: p4})
		};
	});
var _opensolid$geometry$OpenSolid_CubicSpline2d$bisect = _opensolid$geometry$OpenSolid_CubicSpline2d$splitAt(0.5);

var _opensolid$geometry$OpenSolid_LineSegment2d$endpoints = function (_p0) {
	var _p1 = _p0;
	return _p1._0;
};
var _opensolid$geometry$OpenSolid_LineSegment2d$interpolate = function (lineSegment) {
	var _p2 = _opensolid$geometry$OpenSolid_LineSegment2d$endpoints(lineSegment);
	var start = _p2._0;
	var end = _p2._1;
	return A2(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, start, end);
};
var _opensolid$geometry$OpenSolid_LineSegment2d$midpoint = function (lineSegment) {
	return A2(_opensolid$geometry$OpenSolid_LineSegment2d$interpolate, lineSegment, 0.5);
};
var _opensolid$geometry$OpenSolid_LineSegment2d$vector = function (lineSegment) {
	var _p3 = _opensolid$geometry$OpenSolid_LineSegment2d$endpoints(lineSegment);
	var p1 = _p3._0;
	var p2 = _p3._1;
	return A2(_opensolid$geometry$OpenSolid_Vector2d$from, p1, p2);
};
var _opensolid$geometry$OpenSolid_LineSegment2d$length = function (_p4) {
	return _opensolid$geometry$OpenSolid_Vector2d$length(
		_opensolid$geometry$OpenSolid_LineSegment2d$vector(_p4));
};
var _opensolid$geometry$OpenSolid_LineSegment2d$squaredLength = function (_p5) {
	return _opensolid$geometry$OpenSolid_Vector2d$squaredLength(
		_opensolid$geometry$OpenSolid_LineSegment2d$vector(_p5));
};
var _opensolid$geometry$OpenSolid_LineSegment2d$direction = function (_p6) {
	return _opensolid$geometry$OpenSolid_Vector2d$direction(
		_opensolid$geometry$OpenSolid_LineSegment2d$vector(_p6));
};
var _opensolid$geometry$OpenSolid_LineSegment2d$normalDirection = function (_p7) {
	return _opensolid$geometry$OpenSolid_Vector2d$direction(
		_opensolid$geometry$OpenSolid_Vector2d$perpendicularTo(
			_opensolid$geometry$OpenSolid_LineSegment2d$vector(_p7)));
};
var _opensolid$geometry$OpenSolid_LineSegment2d$intersectionPoint = F2(
	function (lineSegment1, lineSegment2) {
		var _p8 = _opensolid$geometry$OpenSolid_LineSegment2d$endpoints(lineSegment2);
		var q = _p8._0;
		var q_ = _p8._1;
		var _p9 = _opensolid$geometry$OpenSolid_LineSegment2d$endpoints(lineSegment1);
		var p = _p9._0;
		var p_ = _p9._1;
		var _p10 = {
			ctor: '_Tuple5',
			_0: _opensolid$geometry$OpenSolid_LineSegment2d$vector(lineSegment1),
			_1: _opensolid$geometry$OpenSolid_LineSegment2d$vector(lineSegment2),
			_2: A2(_opensolid$geometry$OpenSolid_Vector2d$from, p, q),
			_3: A2(_opensolid$geometry$OpenSolid_Vector2d$from, p, q_),
			_4: A2(_opensolid$geometry$OpenSolid_Vector2d$from, q, p_)
		};
		var r = _p10._0;
		var s = _p10._1;
		var pq = _p10._2;
		var pq_ = _p10._3;
		var qp_ = _p10._4;
		var _p11 = {
			ctor: '_Tuple4',
			_0: A2(_opensolid$geometry$OpenSolid_Vector2d$crossProduct, pq, r),
			_1: A2(_opensolid$geometry$OpenSolid_Vector2d$crossProduct, pq, s),
			_2: A2(_opensolid$geometry$OpenSolid_Vector2d$crossProduct, s, qp_),
			_3: A2(_opensolid$geometry$OpenSolid_Vector2d$crossProduct, r, pq_)
		};
		var pqXr = _p11._0;
		var pqXs = _p11._1;
		var sXqp_ = _p11._2;
		var rXpq_ = _p11._3;
		var _p12 = {ctor: '_Tuple2', _0: pqXs - sXqp_, _1: pqXr + rXpq_};
		var tDenominator = _p12._0;
		var uDenominator = _p12._1;
		if (_elm_lang$core$Native_Utils.eq(tDenominator, 0) || _elm_lang$core$Native_Utils.eq(uDenominator, 0)) {
			return (_elm_lang$core$Native_Utils.cmp(
				A2(_opensolid$geometry$OpenSolid_Vector2d$dotProduct, r, s),
				0) < 0) ? (_elm_lang$core$Native_Utils.eq(p_, q_) ? _elm_lang$core$Maybe$Just(p_) : (_elm_lang$core$Native_Utils.eq(p, q) ? _elm_lang$core$Maybe$Just(p) : _elm_lang$core$Maybe$Nothing)) : (_elm_lang$core$Native_Utils.eq(p_, q) ? _elm_lang$core$Maybe$Just(p_) : (_elm_lang$core$Native_Utils.eq(p, q_) ? _elm_lang$core$Maybe$Just(p) : _elm_lang$core$Maybe$Nothing));
		} else {
			var _p13 = {ctor: '_Tuple2', _0: pqXs / tDenominator, _1: pqXr / uDenominator};
			var t = _p13._0;
			var u = _p13._1;
			if (((_elm_lang$core$Native_Utils.cmp(0, t) < 1) && (_elm_lang$core$Native_Utils.cmp(t, 1) < 1)) && ((_elm_lang$core$Native_Utils.cmp(0, u) < 1) && (_elm_lang$core$Native_Utils.cmp(u, 1) < 1))) {
				var intersection = (_elm_lang$core$Native_Utils.cmp(
					A2(_elm_lang$core$Basics$min, t, 1 - t),
					A2(_elm_lang$core$Basics$min, u, 1 - u)) < 1) ? A2(_opensolid$geometry$OpenSolid_LineSegment2d$interpolate, lineSegment1, t) : A2(_opensolid$geometry$OpenSolid_LineSegment2d$interpolate, lineSegment2, u);
				return _elm_lang$core$Maybe$Just(intersection);
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}
	});
var _opensolid$geometry$OpenSolid_LineSegment2d$boundingBox = function (lineSegment) {
	var _p14 = _opensolid$geometry$OpenSolid_LineSegment2d$endpoints(lineSegment);
	var p1 = _p14._0;
	var p2 = _p14._1;
	return A2(_opensolid$geometry$OpenSolid_Point2d$hull, p1, p2);
};
var _opensolid$geometry$OpenSolid_LineSegment2d$endPoint = function (_p15) {
	var _p16 = _p15;
	return _p16._0._1;
};
var _opensolid$geometry$OpenSolid_LineSegment2d$startPoint = function (_p17) {
	var _p18 = _p17;
	return _p18._0._0;
};
var _opensolid$geometry$OpenSolid_LineSegment2d$fromEndpoints = _opensolid$geometry$OpenSolid_Geometry_Internal$LineSegment2d;
var _opensolid$geometry$OpenSolid_LineSegment2d$from = F2(
	function (startPoint, endPoint) {
		return _opensolid$geometry$OpenSolid_LineSegment2d$fromEndpoints(
			{ctor: '_Tuple2', _0: startPoint, _1: endPoint});
	});
var _opensolid$geometry$OpenSolid_LineSegment2d$along = F3(
	function (axis, start, end) {
		return _opensolid$geometry$OpenSolid_LineSegment2d$fromEndpoints(
			{
				ctor: '_Tuple2',
				_0: A2(_opensolid$geometry$OpenSolid_Point2d$along, axis, start),
				_1: A2(_opensolid$geometry$OpenSolid_Point2d$along, axis, end)
			});
	});
var _opensolid$geometry$OpenSolid_LineSegment2d$reverse = function (lineSegment) {
	var _p19 = _opensolid$geometry$OpenSolid_LineSegment2d$endpoints(lineSegment);
	var p1 = _p19._0;
	var p2 = _p19._1;
	return _opensolid$geometry$OpenSolid_LineSegment2d$fromEndpoints(
		{ctor: '_Tuple2', _0: p2, _1: p1});
};
var _opensolid$geometry$OpenSolid_LineSegment2d$mapEndpoints = F2(
	function ($function, lineSegment) {
		var _p20 = _opensolid$geometry$OpenSolid_LineSegment2d$endpoints(lineSegment);
		var p1 = _p20._0;
		var p2 = _p20._1;
		return _opensolid$geometry$OpenSolid_LineSegment2d$fromEndpoints(
			{
				ctor: '_Tuple2',
				_0: $function(p1),
				_1: $function(p2)
			});
	});
var _opensolid$geometry$OpenSolid_LineSegment2d$scaleAbout = F2(
	function (point, scale) {
		return _opensolid$geometry$OpenSolid_LineSegment2d$mapEndpoints(
			A2(_opensolid$geometry$OpenSolid_Point2d$scaleAbout, point, scale));
	});
var _opensolid$geometry$OpenSolid_LineSegment2d$rotateAround = F2(
	function (centerPoint, angle) {
		return _opensolid$geometry$OpenSolid_LineSegment2d$mapEndpoints(
			A2(_opensolid$geometry$OpenSolid_Point2d$rotateAround, centerPoint, angle));
	});
var _opensolid$geometry$OpenSolid_LineSegment2d$translateBy = function (vector) {
	return _opensolid$geometry$OpenSolid_LineSegment2d$mapEndpoints(
		_opensolid$geometry$OpenSolid_Point2d$translateBy(vector));
};
var _opensolid$geometry$OpenSolid_LineSegment2d$mirrorAcross = function (axis) {
	return _opensolid$geometry$OpenSolid_LineSegment2d$mapEndpoints(
		_opensolid$geometry$OpenSolid_Point2d$mirrorAcross(axis));
};
var _opensolid$geometry$OpenSolid_LineSegment2d$projectOnto = function (axis) {
	return _opensolid$geometry$OpenSolid_LineSegment2d$mapEndpoints(
		_opensolid$geometry$OpenSolid_Point2d$projectOnto(axis));
};
var _opensolid$geometry$OpenSolid_LineSegment2d$relativeTo = function (frame) {
	return _opensolid$geometry$OpenSolid_LineSegment2d$mapEndpoints(
		_opensolid$geometry$OpenSolid_Point2d$relativeTo(frame));
};
var _opensolid$geometry$OpenSolid_LineSegment2d$placeIn = function (frame) {
	return _opensolid$geometry$OpenSolid_LineSegment2d$mapEndpoints(
		_opensolid$geometry$OpenSolid_Point2d$placeIn(frame));
};

var _opensolid$geometry$OpenSolid_QuadraticSpline2d$endPoint = function (_p0) {
	var _p1 = _p0;
	return _p1._0._2;
};
var _opensolid$geometry$OpenSolid_QuadraticSpline2d$startPoint = function (_p2) {
	var _p3 = _p2;
	return _p3._0._0;
};
var _opensolid$geometry$OpenSolid_QuadraticSpline2d$controlPoints = function (_p4) {
	var _p5 = _p4;
	return _p5._0;
};
var _opensolid$geometry$OpenSolid_QuadraticSpline2d$startDerivative = function (spline) {
	var _p6 = _opensolid$geometry$OpenSolid_QuadraticSpline2d$controlPoints(spline);
	var p1 = _p6._0;
	var p2 = _p6._1;
	return A2(
		_opensolid$geometry$OpenSolid_Vector2d$scaleBy,
		2,
		A2(_opensolid$geometry$OpenSolid_Vector2d$from, p1, p2));
};
var _opensolid$geometry$OpenSolid_QuadraticSpline2d$endDerivative = function (spline) {
	var _p7 = _opensolid$geometry$OpenSolid_QuadraticSpline2d$controlPoints(spline);
	var p2 = _p7._1;
	var p3 = _p7._2;
	return A2(
		_opensolid$geometry$OpenSolid_Vector2d$scaleBy,
		2,
		A2(_opensolid$geometry$OpenSolid_Vector2d$from, p2, p3));
};
var _opensolid$geometry$OpenSolid_QuadraticSpline2d$pointOn = F2(
	function (spline, t) {
		var _p8 = _opensolid$geometry$OpenSolid_QuadraticSpline2d$controlPoints(spline);
		var p1 = _p8._0;
		var p2 = _p8._1;
		var p3 = _p8._2;
		var q1 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, p1, p2, t);
		var q2 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, p2, p3, t);
		return A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, q1, q2, t);
	});
var _opensolid$geometry$OpenSolid_QuadraticSpline2d$derivative = function (spline) {
	var _p9 = _opensolid$geometry$OpenSolid_QuadraticSpline2d$controlPoints(spline);
	var p1 = _p9._0;
	var p2 = _p9._1;
	var p3 = _p9._2;
	var v1 = A2(_opensolid$geometry$OpenSolid_Vector2d$from, p1, p2);
	var v2 = A2(_opensolid$geometry$OpenSolid_Vector2d$from, p2, p3);
	return function (t) {
		return A2(
			_opensolid$geometry$OpenSolid_Vector2d$scaleBy,
			2,
			A3(_opensolid$geometry$OpenSolid_Vector2d$interpolateFrom, v1, v2, t));
	};
};
var _opensolid$geometry$OpenSolid_QuadraticSpline2d$evaluate = F2(
	function (spline, t) {
		var _p10 = _opensolid$geometry$OpenSolid_QuadraticSpline2d$controlPoints(spline);
		var p1 = _p10._0;
		var p2 = _p10._1;
		var p3 = _p10._2;
		var q1 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, p1, p2, t);
		var q2 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, p2, p3, t);
		return {
			ctor: '_Tuple2',
			_0: A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, q1, q2, t),
			_1: A2(
				_opensolid$geometry$OpenSolid_Vector2d$scaleBy,
				2,
				A2(_opensolid$geometry$OpenSolid_Vector2d$from, q1, q2))
		};
	});
var _opensolid$geometry$OpenSolid_QuadraticSpline2d$fromControlPoints = _opensolid$geometry$OpenSolid_Geometry_Internal$QuadraticSpline2d;
var _opensolid$geometry$OpenSolid_QuadraticSpline2d$reverse = function (spline) {
	var _p11 = _opensolid$geometry$OpenSolid_QuadraticSpline2d$controlPoints(spline);
	var p1 = _p11._0;
	var p2 = _p11._1;
	var p3 = _p11._2;
	return _opensolid$geometry$OpenSolid_QuadraticSpline2d$fromControlPoints(
		{ctor: '_Tuple3', _0: p3, _1: p2, _2: p1});
};
var _opensolid$geometry$OpenSolid_QuadraticSpline2d$mapControlPoints = F2(
	function ($function, spline) {
		var _p12 = _opensolid$geometry$OpenSolid_QuadraticSpline2d$controlPoints(spline);
		var p1 = _p12._0;
		var p2 = _p12._1;
		var p3 = _p12._2;
		return _opensolid$geometry$OpenSolid_QuadraticSpline2d$fromControlPoints(
			{
				ctor: '_Tuple3',
				_0: $function(p1),
				_1: $function(p2),
				_2: $function(p3)
			});
	});
var _opensolid$geometry$OpenSolid_QuadraticSpline2d$scaleAbout = F2(
	function (point, scale) {
		return _opensolid$geometry$OpenSolid_QuadraticSpline2d$mapControlPoints(
			A2(_opensolid$geometry$OpenSolid_Point2d$scaleAbout, point, scale));
	});
var _opensolid$geometry$OpenSolid_QuadraticSpline2d$rotateAround = F2(
	function (point, angle) {
		return _opensolid$geometry$OpenSolid_QuadraticSpline2d$mapControlPoints(
			A2(_opensolid$geometry$OpenSolid_Point2d$rotateAround, point, angle));
	});
var _opensolid$geometry$OpenSolid_QuadraticSpline2d$translateBy = function (displacement) {
	return _opensolid$geometry$OpenSolid_QuadraticSpline2d$mapControlPoints(
		_opensolid$geometry$OpenSolid_Point2d$translateBy(displacement));
};
var _opensolid$geometry$OpenSolid_QuadraticSpline2d$mirrorAcross = function (axis) {
	return _opensolid$geometry$OpenSolid_QuadraticSpline2d$mapControlPoints(
		_opensolid$geometry$OpenSolid_Point2d$mirrorAcross(axis));
};
var _opensolid$geometry$OpenSolid_QuadraticSpline2d$relativeTo = function (frame) {
	return _opensolid$geometry$OpenSolid_QuadraticSpline2d$mapControlPoints(
		_opensolid$geometry$OpenSolid_Point2d$relativeTo(frame));
};
var _opensolid$geometry$OpenSolid_QuadraticSpline2d$placeIn = function (frame) {
	return _opensolid$geometry$OpenSolid_QuadraticSpline2d$mapControlPoints(
		_opensolid$geometry$OpenSolid_Point2d$placeIn(frame));
};
var _opensolid$geometry$OpenSolid_QuadraticSpline2d$splitAt = F2(
	function (t, spline) {
		var _p13 = _opensolid$geometry$OpenSolid_QuadraticSpline2d$controlPoints(spline);
		var p1 = _p13._0;
		var p2 = _p13._1;
		var p3 = _p13._2;
		var q1 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, p1, p2, t);
		var q2 = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, p2, p3, t);
		var r = A3(_opensolid$geometry$OpenSolid_Point2d$interpolateFrom, q1, q2, t);
		return {
			ctor: '_Tuple2',
			_0: _opensolid$geometry$OpenSolid_QuadraticSpline2d$fromControlPoints(
				{ctor: '_Tuple3', _0: p1, _1: q1, _2: r}),
			_1: _opensolid$geometry$OpenSolid_QuadraticSpline2d$fromControlPoints(
				{ctor: '_Tuple3', _0: r, _1: q2, _2: p3})
		};
	});
var _opensolid$geometry$OpenSolid_QuadraticSpline2d$bisect = _opensolid$geometry$OpenSolid_QuadraticSpline2d$splitAt(0.5);

var _folkertdev$one_true_path_experiment$Geometry_Approximate$approximate = F3(
	function (config, data, s) {
		approximate:
		while (true) {
			var splitFurther = function (data) {
				var upper = config.upperBound(data);
				var lower = config.lowerBound(data);
				var average = (lower + upper) / 2;
				return _elm_lang$core$Native_Utils.cmp((average - lower) / average, config.percentageError) > 0;
			};
			if (splitFurther(data)) {
				var _p0 = A2(config.split, 0.5, data);
				var left = _p0._0;
				var right = _p0._1;
				if (_elm_lang$core$Native_Utils.cmp(
					s,
					config.lowerBound(left)) < 0) {
					var _v0 = config,
						_v1 = left,
						_v2 = s;
					config = _v0;
					data = _v1;
					s = _v2;
					continue approximate;
				} else {
					if (_elm_lang$core$Native_Utils.cmp(
						s,
						config.upperBound(data)) > 0) {
						return _elm_lang$core$Maybe$Nothing;
					} else {
						if (_elm_lang$core$Native_Utils.cmp(
							s,
							config.upperBound(left)) > 0) {
							var _v3 = config,
								_v4 = right,
								_v5 = s - config.length(left);
							config = _v3;
							data = _v4;
							s = _v5;
							continue approximate;
						} else {
							var _p1 = A3(_folkertdev$one_true_path_experiment$Geometry_Approximate$approximate, config, left, s);
							if (_p1.ctor === 'Just') {
								return _elm_lang$core$Maybe$Just(_p1._0);
							} else {
								var _v7 = config,
									_v8 = right,
									_v9 = s - config.length(left);
								config = _v7;
								data = _v8;
								s = _v9;
								continue approximate;
							}
						}
					}
				}
			} else {
				return config.baseCase(data);
			}
		}
	});
var _folkertdev$one_true_path_experiment$Geometry_Approximate$Config = F6(
	function (a, b, c, d, e, f) {
		return {split: a, percentageError: b, upperBound: c, lowerBound: d, baseCase: e, length: f};
	});

var _folkertdev$one_true_path_experiment$Geometry_Line$length = F2(
	function (start, end) {
		return A2(_Zinggi$elm_webgl_math$Vector2$distance, start, end);
	});
var _folkertdev$one_true_path_experiment$Geometry_Line$lengthParameterization = F3(
	function (start, end, s) {
		var size = A2(_folkertdev$one_true_path_experiment$Geometry_Line$length, start, end);
		return (_elm_lang$core$Native_Utils.cmp(s, size) > 0) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
			A2(
				_Zinggi$elm_webgl_math$Vector2$add,
				start,
				A2(
					_Zinggi$elm_webgl_math$Vector2$scale,
					s / size,
					A2(_Zinggi$elm_webgl_math$Vector2$sub, end, start))));
	});

var _folkertdev$one_true_path_experiment$Geometry_Ellipse$angle = F2(
	function (u, v) {
		var argument = A3(
			_elm_lang$core$Basics$clamp,
			-1,
			1,
			A2(_Zinggi$elm_webgl_math$Vector2$dot, u, v) / (_Zinggi$elm_webgl_math$Vector2$length(u) * _Zinggi$elm_webgl_math$Vector2$length(v)));
		var _p0 = ((_elm_lang$core$Native_Utils.cmp(argument, -1) < 0) || (_elm_lang$core$Native_Utils.cmp(argument, 1) > 0)) ? A2(_elm_lang$core$Debug$log, 'argument is wrong', argument) : 0;
		var q = _elm_lang$core$Basics$acos(argument);
		var _p1 = v;
		var vx = _p1._0;
		var vy = _p1._1;
		var _p2 = u;
		var ux = _p2._0;
		var uy = _p2._1;
		var sign = (_elm_lang$core$Native_Utils.cmp((ux * vy) - (uy * vx), 0) < 0) ? -1 : 1;
		return sign * _elm_lang$core$Basics$abs(q);
	});
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$inverseConversionMatrix = function (xAxisRotate) {
	return {
		ctor: '_Tuple2',
		_0: {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Basics$cos(xAxisRotate),
			_1: _elm_lang$core$Basics$sin(xAxisRotate)
		},
		_1: {
			ctor: '_Tuple2',
			_0: -1 * _elm_lang$core$Basics$sin(xAxisRotate),
			_1: _elm_lang$core$Basics$cos(xAxisRotate)
		}
	};
};
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$coordinatePrime = function (_p3) {
	var _p4 = _p3;
	var _p9 = _p4.start;
	var _p8 = _p4.end;
	var _p5 = _p8;
	var x2 = _p5._0;
	var y2 = _p5._1;
	var _p6 = _p9;
	var x1 = _p6._0;
	var y1 = _p6._1;
	var rotate = _folkertdev$one_true_path_experiment$Geometry_Ellipse$inverseConversionMatrix(_p4.xAxisRotate);
	var _p7 = A2(
		_Zinggi$elm_webgl_math$Matrix2$mulVector,
		rotate,
		A2(
			_Zinggi$elm_webgl_math$Vector2$divideBy,
			2,
			A2(_Zinggi$elm_webgl_math$Vector2$sub, _p9, _p8)));
	var x1_ = _p7._0;
	var y1_ = _p7._1;
	return {ctor: '_Tuple2', _0: x1_, _1: y1_};
};
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$conversionMatrix = function (xAxisRotate) {
	return {
		ctor: '_Tuple2',
		_0: {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Basics$cos(xAxisRotate),
			_1: -1 * _elm_lang$core$Basics$sin(xAxisRotate)
		},
		_1: {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Basics$sin(xAxisRotate),
			_1: _elm_lang$core$Basics$cos(xAxisRotate)
		}
	};
};
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$circumference = function (_p10) {
	var _p11 = _p10;
	var _p12 = _p11.radii;
	var a = _p12._0;
	var b = _p12._1;
	var h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
	var circumference = (_elm_lang$core$Basics$pi * (a + b)) * (1 + ((3 * h) / (10 + _elm_lang$core$Basics$sqrt(4 - (3 * h)))));
	return circumference;
};
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$mod2pi_ = function (x) {
	return x - ((_elm_lang$core$Basics$toFloat(
		_elm_lang$core$Basics$truncate(x / (2 * _elm_lang$core$Basics$pi))) * 2) * _elm_lang$core$Basics$pi);
};
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$mod2pi = _elm_lang$core$Basics$identity;
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$at = F2(
	function (t, _p13) {
		var _p14 = _p13;
		var _p18 = _p14.xAxisRotate;
		var _p15 = _p14.center;
		var cx = _p15._0;
		var cy = _p15._1;
		var _p16 = _p14.radii;
		var rx = _p16._0;
		var ry = _p16._1;
		var _p17 = {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Basics$cos(_p18),
			_1: _elm_lang$core$Basics$sin(_p18)
		};
		var cosr = _p17._0;
		var sinr = _p17._1;
		var angle = _p14.startAngle + (t * _p14.deltaTheta);
		var x = (((cosr * _elm_lang$core$Basics$cos(angle)) * rx) - ((sinr * _elm_lang$core$Basics$sin(angle)) * ry)) + cx;
		var y = (((sinr * _elm_lang$core$Basics$cos(angle)) * rx) + ((cosr * _elm_lang$core$Basics$sin(angle)) * ry)) + cy;
		return {ctor: '_Tuple2', _0: x, _1: y};
	});
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$derivativeAt = F2(
	function (t, parameterization) {
		var _p19 = parameterization.radii;
		var a = _p19._0;
		var b = _p19._1;
		var _p20 = A2(
			_Zinggi$elm_webgl_math$Vector2$sub,
			parameterization.center,
			A2(_folkertdev$one_true_path_experiment$Geometry_Ellipse$at, t, parameterization));
		var x1 = _p20._0;
		var y1 = _p20._1;
		return (Math.pow(b, 2) / Math.pow(a, 2)) * (x1 / y1);
	});
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$tangentAt = F2(
	function (t, parameterization) {
		var _p21 = parameterization.radii;
		var a = _p21._0;
		var b = _p21._1;
		var _p22 = A2(
			_Zinggi$elm_webgl_math$Vector2$sub,
			parameterization.center,
			A2(_folkertdev$one_true_path_experiment$Geometry_Ellipse$at, t, parameterization));
		var x1 = _p22._0;
		var y1 = _p22._1;
		return A2(
			_Zinggi$elm_webgl_math$Matrix2$mulVector,
			_folkertdev$one_true_path_experiment$Geometry_Ellipse$conversionMatrix(_elm_lang$core$Basics$pi / 2),
			_Zinggi$elm_webgl_math$Vector2$normalize(
				A3(
					_Zinggi$elm_webgl_math$Vector2$map2,
					F2(
						function (x, y) {
							return x * y;
						}),
					{
						ctor: '_Tuple2',
						_0: Math.pow(b, 2),
						_1: Math.pow(a, 2)
					},
					{ctor: '_Tuple2', _0: x1, _1: y1})));
	});
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$interpolateFloat = F3(
	function (from, to, time) {
		return from + ((to - from) * time);
	});
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$atAngle = F2(
	function (theta, _p23) {
		var _p24 = _p23;
		return A2(
			_Zinggi$elm_webgl_math$Vector2$add,
			_p24.center,
			A2(
				_Zinggi$elm_webgl_math$Matrix2$mulVector,
				_folkertdev$one_true_path_experiment$Geometry_Ellipse$conversionMatrix(_p24.xAxisRotate),
				A3(
					_Zinggi$elm_webgl_math$Vector2$map2,
					F2(
						function (x, y) {
							return x * y;
						}),
					_p24.radii,
					{
						ctor: '_Tuple2',
						_0: _elm_lang$core$Basics$cos(theta),
						_1: _elm_lang$core$Basics$sin(theta)
					})));
	});
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$chord = function (_p25) {
	var _p26 = _p25;
	return {ctor: '_Tuple2', _0: _p26.start, _1: _p26.end};
};
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$outlineLength = function (_p27) {
	var _p28 = _p27;
	return function (_p29) {
		var _p30 = _p29;
		return _elm_lang$core$Basics$abs(_p30._0) + _elm_lang$core$Basics$abs(_p30._1);
	}(
		A2(_Zinggi$elm_webgl_math$Vector2$sub, _p28.end, _p28.start));
};
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$chordLength = function (_p31) {
	var _p32 = _p31;
	return A2(_Zinggi$elm_webgl_math$Vector2$distance, _p32.start, _p32.end);
};
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$normalize = function (_p33) {
	var _p34 = _p33;
	var _p35 = _p34.xAxisRotate;
	return _elm_lang$core$Native_Utils.update(
		_p34,
		{
			startAngle: _folkertdev$one_true_path_experiment$Geometry_Ellipse$mod2pi(_p34.startAngle - _p35),
			deltaTheta: _folkertdev$one_true_path_experiment$Geometry_Ellipse$mod2pi(_p34.deltaTheta - _p35),
			xAxisRotate: 0
		});
};
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$validateRadii = function (_p36) {
	var _p37 = _p36;
	var _p40 = _p37;
	var _p38 = _p37.radii;
	var rx = _p38._0;
	var ry = _p38._1;
	var _p39 = _folkertdev$one_true_path_experiment$Geometry_Ellipse$coordinatePrime(_p40);
	var x1_ = _p39._0;
	var y1_ = _p39._1;
	var v = (Math.pow(x1_, 2) / Math.pow(rx, 2)) + (Math.pow(y1_, 2) / Math.pow(ry, 2));
	return (_elm_lang$core$Native_Utils.cmp(v, 1) < 1) ? _p40 : _elm_lang$core$Native_Utils.update(
		_p40,
		{
			radii: {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Basics$sqrt(v) * rx,
				_1: _elm_lang$core$Basics$sqrt(v) * ry
			}
		});
};
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$reverse = function (_p41) {
	var _p42 = _p41;
	return _elm_lang$core$Native_Utils.update(
		_p42,
		{
			start: _p42.end,
			end: _p42.start,
			direction: function () {
				var _p43 = _p42.direction;
				if (_p43.ctor === 'Clockwise') {
					return _folkertdev$svg_path_lowlevel$Path_LowLevel$CounterClockwise;
				} else {
					return _folkertdev$svg_path_lowlevel$Path_LowLevel$Clockwise;
				}
			}()
		});
};
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$decodeFlags = function (_p44) {
	var _p45 = _p44;
	var _p46 = {ctor: '_Tuple2', _0: _p45._0, _1: _p45._1};
	_v13_4:
	do {
		if (_p46.ctor === '_Tuple2') {
			switch (_p46._0) {
				case 1:
					switch (_p46._1) {
						case 0:
							return _elm_lang$core$Maybe$Just(
								{ctor: '_Tuple2', _0: _folkertdev$svg_path_lowlevel$Path_LowLevel$LargestArc, _1: _folkertdev$svg_path_lowlevel$Path_LowLevel$Clockwise});
						case 1:
							return _elm_lang$core$Maybe$Just(
								{ctor: '_Tuple2', _0: _folkertdev$svg_path_lowlevel$Path_LowLevel$LargestArc, _1: _folkertdev$svg_path_lowlevel$Path_LowLevel$CounterClockwise});
						default:
							break _v13_4;
					}
				case 0:
					switch (_p46._1) {
						case 0:
							return _elm_lang$core$Maybe$Just(
								{ctor: '_Tuple2', _0: _folkertdev$svg_path_lowlevel$Path_LowLevel$SmallestArc, _1: _folkertdev$svg_path_lowlevel$Path_LowLevel$Clockwise});
						case 1:
							return _elm_lang$core$Maybe$Just(
								{ctor: '_Tuple2', _0: _folkertdev$svg_path_lowlevel$Path_LowLevel$SmallestArc, _1: _folkertdev$svg_path_lowlevel$Path_LowLevel$CounterClockwise});
						default:
							break _v13_4;
					}
				default:
					break _v13_4;
			}
		} else {
			break _v13_4;
		}
	} while(false);
	return _elm_lang$core$Maybe$Nothing;
};
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$centerToEndpoint = function (_p47) {
	var _p48 = _p47;
	var _p55 = _p48.xAxisRotate;
	var _p54 = _p48.startAngle;
	var _p53 = _p48.radii;
	var _p52 = _p48.deltaTheta;
	var _p51 = _p48.center;
	var _p49 = A2(
		_elm_lang$core$Maybe$withDefault,
		{ctor: '_Tuple2', _0: _folkertdev$svg_path_lowlevel$Path_LowLevel$SmallestArc, _1: _folkertdev$svg_path_lowlevel$Path_LowLevel$CounterClockwise},
		_folkertdev$one_true_path_experiment$Geometry_Ellipse$decodeFlags(
			{
				ctor: '_Tuple2',
				_0: (_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$Basics$abs(_p52),
					_elm_lang$core$Basics$pi) > 0) ? 1 : 0,
				_1: (_elm_lang$core$Native_Utils.cmp(_p52, 0) > 0) ? 1 : 0
			}));
	var arcFlag = _p49._0;
	var direction = _p49._1;
	var _p50 = _p53;
	var rx = _p50._0;
	var ry = _p50._1;
	var endAngle = _p54 + _p52;
	var conversion = _folkertdev$one_true_path_experiment$Geometry_Ellipse$conversionMatrix(_p55);
	var p1 = A2(
		_Zinggi$elm_webgl_math$Vector2$add,
		_p51,
		A2(
			_Zinggi$elm_webgl_math$Matrix2$mulVector,
			conversion,
			{
				ctor: '_Tuple2',
				_0: rx * _elm_lang$core$Basics$cos(_p54),
				_1: ry * _elm_lang$core$Basics$sin(_p54)
			}));
	var p2 = A2(
		_Zinggi$elm_webgl_math$Vector2$add,
		_p51,
		A2(
			_Zinggi$elm_webgl_math$Matrix2$mulVector,
			conversion,
			{
				ctor: '_Tuple2',
				_0: rx * _elm_lang$core$Basics$cos(endAngle),
				_1: ry * _elm_lang$core$Basics$sin(endAngle)
			}));
	return {start: p1, end: p2, radii: _p53, arcFlag: arcFlag, direction: direction, xAxisRotate: _p55};
};
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$encodeFlags = function (_p56) {
	var _p57 = _p56;
	var _p58 = {ctor: '_Tuple2', _0: _p57._0, _1: _p57._1};
	if (_p58._0.ctor === 'LargestArc') {
		if (_p58._1.ctor === 'Clockwise') {
			return {ctor: '_Tuple2', _0: 1, _1: 0};
		} else {
			return {ctor: '_Tuple2', _0: 1, _1: 1};
		}
	} else {
		if (_p58._1.ctor === 'Clockwise') {
			return {ctor: '_Tuple2', _0: 0, _1: 0};
		} else {
			return {ctor: '_Tuple2', _0: 0, _1: 1};
		}
	}
};
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$tau = 2 * _elm_lang$core$Basics$pi;
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$arcLengthParameterizationCircle = F2(
	function (_p59, s) {
		var _p60 = _p59;
		var _p62 = _p60.deltaTheta;
		var ratio = _p62 / _folkertdev$one_true_path_experiment$Geometry_Ellipse$tau;
		var _p61 = _p60.radii;
		var rx = _p61._0;
		var ry = _p61._1;
		var circumference = (2 * _elm_lang$core$Basics$pi) * rx;
		var circumferenceUsed = ratio * circumference;
		var fraction = s / circumferenceUsed;
		var angleAtS = _p60.startAngle + (fraction * _p62);
		return _elm_lang$core$Maybe$Just(
			A2(
				_Zinggi$elm_webgl_math$Vector2$add,
				_p60.center,
				_elm_lang$core$Basics$fromPolar(
					{ctor: '_Tuple2', _0: rx, _1: angleAtS})));
	});
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$endpointToCenter = function (_p63) {
	var _p64 = _p63;
	var _p73 = _p64.xAxisRotate;
	var _p72 = _p64.radii;
	var _p71 = _p64.direction;
	var _p70 = _p64.arcFlag;
	var sign = function () {
		var _p65 = {ctor: '_Tuple2', _0: _p70, _1: _p71};
		if (_p65._0.ctor === 'LargestArc') {
			if (_p65._1.ctor === 'Clockwise') {
				return 1;
			} else {
				return -1;
			}
		} else {
			if (_p65._1.ctor === 'Clockwise') {
				return -1;
			} else {
				return 1;
			}
		}
	}();
	var _p66 = _folkertdev$one_true_path_experiment$Geometry_Ellipse$coordinatePrime(_p64);
	var x1_ = _p66._0;
	var y1_ = _p66._1;
	var p1 = {ctor: '_Tuple2', _0: x1_, _1: y1_};
	var _p67 = _p72;
	var rx = _p67._0;
	var ry = _p67._1;
	var numerator = ((Math.pow(rx, 2) * Math.pow(ry, 2)) - (Math.pow(rx, 2) * Math.pow(y1_, 2))) - (Math.pow(ry, 2) * Math.pow(x1_, 2));
	var denominator = (Math.pow(rx, 2) * Math.pow(y1_, 2)) + (Math.pow(ry, 2) * Math.pow(x1_, 2));
	var root = (_elm_lang$core$Native_Utils.eq(denominator, 0) || (_elm_lang$core$Native_Utils.cmp(numerator, 0) < 0)) ? 0 : (sign * _elm_lang$core$Basics$sqrt(numerator / denominator));
	var center_ = {ctor: '_Tuple2', _0: ((rx * y1_) / ry) * root, _1: (-1 * ((ry * x1_) / rx)) * root};
	var center = A2(
		_Zinggi$elm_webgl_math$Vector2$add,
		A2(
			_Zinggi$elm_webgl_math$Vector2$divideBy,
			2,
			A2(_Zinggi$elm_webgl_math$Vector2$add, _p64.start, _p64.end)),
		A2(
			_Zinggi$elm_webgl_math$Matrix2$mulVector,
			_folkertdev$one_true_path_experiment$Geometry_Ellipse$conversionMatrix(_p73),
			center_));
	var deltaTheta = function () {
		var second = A3(
			_Zinggi$elm_webgl_math$Vector2$map2,
			F2(
				function (x, y) {
					return x / y;
				}),
			A2(
				_Zinggi$elm_webgl_math$Vector2$sub,
				_Zinggi$elm_webgl_math$Vector2$negate(p1),
				center_),
			_p72);
		var first = A3(
			_Zinggi$elm_webgl_math$Vector2$map2,
			F2(
				function (x, y) {
					return x / y;
				}),
			A2(_Zinggi$elm_webgl_math$Vector2$sub, p1, center_),
			_p72);
		var _p68 = {ctor: '_Tuple2', _0: _p70, _1: _p71};
		if (_p68._0.ctor === 'LargestArc') {
			if (_p68._1.ctor === 'Clockwise') {
				return A2(_folkertdev$one_true_path_experiment$Geometry_Ellipse$angle, first, second) - (2 * _elm_lang$core$Basics$pi);
			} else {
				return A2(_folkertdev$one_true_path_experiment$Geometry_Ellipse$angle, first, second) + (2 * _elm_lang$core$Basics$pi);
			}
		} else {
			if (_p68._1.ctor === 'Clockwise') {
				return A2(_folkertdev$one_true_path_experiment$Geometry_Ellipse$angle, first, second);
			} else {
				return A2(_folkertdev$one_true_path_experiment$Geometry_Ellipse$angle, first, second);
			}
		}
	}();
	var startAngle = function () {
		var _p69 = _folkertdev$one_true_path_experiment$Geometry_Ellipse$encodeFlags(
			{ctor: '_Tuple2', _0: _p70, _1: _p71});
		var fs = _p69._1;
		var temp = A2(
			_folkertdev$one_true_path_experiment$Geometry_Ellipse$angle,
			{ctor: '_Tuple2', _0: 1, _1: 0},
			A3(
				_elm_lang$core$Basics$flip,
				_Zinggi$elm_webgl_math$Vector2$map2(
					F2(
						function (x, y) {
							return x / y;
						})),
				_p72,
				A2(_Zinggi$elm_webgl_math$Vector2$sub, p1, center_)));
		return _folkertdev$one_true_path_experiment$Geometry_Ellipse$mod2pi_(
			(_elm_lang$core$Native_Utils.eq(fs, 0) && (_elm_lang$core$Native_Utils.cmp(deltaTheta, 0) > 0)) ? (temp - _folkertdev$one_true_path_experiment$Geometry_Ellipse$tau) : ((_elm_lang$core$Native_Utils.eq(fs, 1) && (_elm_lang$core$Native_Utils.cmp(deltaTheta, 0) < 0)) ? (temp + _folkertdev$one_true_path_experiment$Geometry_Ellipse$tau) : temp));
	}();
	var result = {center: center, xAxisRotate: _p73, startAngle: startAngle, deltaTheta: deltaTheta, radii: _p72};
	return result;
};
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$splitEllipse = F2(
	function (t, parameterization) {
		var middlePoint = A2(
			_folkertdev$one_true_path_experiment$Geometry_Ellipse$at,
			t,
			_folkertdev$one_true_path_experiment$Geometry_Ellipse$endpointToCenter(parameterization));
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				parameterization,
				{end: middlePoint}),
			_1: _elm_lang$core$Native_Utils.update(
				parameterization,
				{start: middlePoint})
		};
	});
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$chunks = F2(
	function (itersLeft, _p74) {
		var _p75 = _p74;
		var _p77 = _p75;
		if (_elm_lang$core$Native_Utils.cmp(itersLeft, 0) < 1) {
			return {
				ctor: '::',
				_0: _p77,
				_1: {ctor: '[]'}
			};
		} else {
			var chord = A2(_Zinggi$elm_webgl_math$Vector2$distance, _p75.start, _p75.end);
			var _p76 = A2(_folkertdev$one_true_path_experiment$Geometry_Ellipse$splitEllipse, 0.5, _p77);
			var left = _p76._0;
			var right = _p76._1;
			var outline = A2(_Zinggi$elm_webgl_math$Vector2$distance, left.start, left.end) + A2(_Zinggi$elm_webgl_math$Vector2$distance, right.start, right.end);
			var average = (chord + outline) / 2;
			return (_elm_lang$core$Native_Utils.cmp((average - chord) / average, 1.0e-3) > 0) ? A2(
				_elm_lang$core$Basics_ops['++'],
				A2(_folkertdev$one_true_path_experiment$Geometry_Ellipse$chunks, itersLeft - 1, left),
				A2(_folkertdev$one_true_path_experiment$Geometry_Ellipse$chunks, itersLeft - 1, right)) : {
				ctor: '::',
				_0: left,
				_1: {
					ctor: '::',
					_0: right,
					_1: {ctor: '[]'}
				}
			};
		}
	});
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$approximateArcLength = function (_p78) {
	var _p79 = _p78;
	return _elm_lang$core$Native_Utils.eq(_p79.start, _p79.end) ? 0 : _elm_lang$core$List$sum(
		A2(
			_elm_lang$core$List$map,
			function (_p80) {
				var _p81 = _p80;
				return A2(_Zinggi$elm_webgl_math$Vector2$distance, _p81.start, _p81.end);
			},
			A2(_folkertdev$one_true_path_experiment$Geometry_Ellipse$chunks, 10, _p79)));
};
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$arcLengthParameterizationEllipse = F2(
	function (_p82, s) {
		var _p83 = _p82;
		var config = {
			split: _folkertdev$one_true_path_experiment$Geometry_Ellipse$splitEllipse,
			upperBound: _folkertdev$one_true_path_experiment$Geometry_Ellipse$outlineLength,
			lowerBound: _folkertdev$one_true_path_experiment$Geometry_Ellipse$chordLength,
			percentageError: 1.0e-2,
			baseCase: function (_p84) {
				var _p85 = _p84;
				return A3(_folkertdev$one_true_path_experiment$Geometry_Line$lengthParameterization, _p85.start, _p85.end, s);
			},
			length: _folkertdev$one_true_path_experiment$Geometry_Ellipse$approximateArcLength
		};
		return A3(_folkertdev$one_true_path_experiment$Geometry_Approximate$approximate, config, _p83, s);
	});
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$EndpointParameterization = F6(
	function (a, b, c, d, e, f) {
		return {start: a, end: b, radii: c, xAxisRotate: d, arcFlag: e, direction: f};
	});
var _folkertdev$one_true_path_experiment$Geometry_Ellipse$CenterParameterization = F5(
	function (a, b, c, d, e) {
		return {center: a, radii: b, startAngle: c, deltaTheta: d, xAxisRotate: e};
	});

var _folkertdev$one_true_path_experiment$Segment$intersections = F2(
	function (segment1, segment2) {
		return {ctor: '[]'};
	});
var _folkertdev$one_true_path_experiment$Segment$length = function (segment) {
	return 0;
};
var _folkertdev$one_true_path_experiment$Segment$signedAngle = F2(
	function (u, v) {
		var q = _elm_lang$core$Basics$acos(
			A2(_Zinggi$elm_webgl_math$Vector2$dot, u, v) / (_Zinggi$elm_webgl_math$Vector2$length(u) * _Zinggi$elm_webgl_math$Vector2$length(v)));
		var _p0 = v;
		var vx = _p0._0;
		var vy = _p0._1;
		var _p1 = u;
		var ux = _p1._0;
		var uy = _p1._1;
		var sign = (_elm_lang$core$Native_Utils.cmp((ux * vy) - (uy * vx), 0) < 0) ? -1 : 1;
		return sign * _elm_lang$core$Basics$abs(q);
	});
var _folkertdev$one_true_path_experiment$Segment$derivativeAtFinal = function (segment) {
	var _p2 = segment;
	switch (_p2.ctor) {
		case 'LineSegment':
			return _opensolid$geometry$OpenSolid_Vector2d$components(
				_opensolid$geometry$OpenSolid_Vector2d$normalize(
					_opensolid$geometry$OpenSolid_LineSegment2d$vector(_p2._0)));
		case 'Quadratic':
			return _opensolid$geometry$OpenSolid_Vector2d$components(
				_opensolid$geometry$OpenSolid_QuadraticSpline2d$endDerivative(_p2._0));
		case 'Cubic':
			return _opensolid$geometry$OpenSolid_Vector2d$components(
				_opensolid$geometry$OpenSolid_CubicSpline2d$endDerivative(_p2._0));
		default:
			return {
				ctor: '_Tuple2',
				_0: 1,
				_1: A2(
					_folkertdev$one_true_path_experiment$Geometry_Ellipse$derivativeAt,
					1,
					_folkertdev$one_true_path_experiment$Geometry_Ellipse$endpointToCenter(_p2._0))
			};
	}
};
var _folkertdev$one_true_path_experiment$Segment$derivativeAtFirst = function (segment) {
	var _p3 = segment;
	switch (_p3.ctor) {
		case 'LineSegment':
			return _opensolid$geometry$OpenSolid_Vector2d$components(
				_opensolid$geometry$OpenSolid_Vector2d$normalize(
					_opensolid$geometry$OpenSolid_LineSegment2d$vector(_p3._0)));
		case 'Quadratic':
			return _opensolid$geometry$OpenSolid_Vector2d$components(
				_opensolid$geometry$OpenSolid_QuadraticSpline2d$startDerivative(_p3._0));
		case 'Cubic':
			return _opensolid$geometry$OpenSolid_Vector2d$components(
				_opensolid$geometry$OpenSolid_CubicSpline2d$startDerivative(_p3._0));
		default:
			return {
				ctor: '_Tuple2',
				_0: 1,
				_1: A2(
					_folkertdev$one_true_path_experiment$Geometry_Ellipse$derivativeAt,
					0,
					_folkertdev$one_true_path_experiment$Geometry_Ellipse$endpointToCenter(_p3._0))
			};
	}
};
var _folkertdev$one_true_path_experiment$Segment$angle = F2(
	function (seg1, seg2) {
		return A2(
			_folkertdev$one_true_path_experiment$Segment$signedAngle,
			_Zinggi$elm_webgl_math$Vector2$negate(
				_folkertdev$one_true_path_experiment$Segment$derivativeAtFinal(seg1)),
			_Zinggi$elm_webgl_math$Vector2$negate(
				_folkertdev$one_true_path_experiment$Segment$derivativeAtFirst(seg2)));
	});
var _folkertdev$one_true_path_experiment$Segment$derivativeAt = F2(
	function (t, segment) {
		var _p4 = segment;
		switch (_p4.ctor) {
			case 'LineSegment':
				return _opensolid$geometry$OpenSolid_Vector2d$components(
					_opensolid$geometry$OpenSolid_Vector2d$normalize(
						_opensolid$geometry$OpenSolid_LineSegment2d$vector(_p4._0)));
			case 'Quadratic':
				return _opensolid$geometry$OpenSolid_Vector2d$components(
					A2(_opensolid$geometry$OpenSolid_QuadraticSpline2d$derivative, _p4._0, t));
			case 'Cubic':
				return _opensolid$geometry$OpenSolid_Vector2d$components(
					A2(_opensolid$geometry$OpenSolid_CubicSpline2d$derivative, _p4._0, t));
			default:
				return {
					ctor: '_Tuple2',
					_0: 1,
					_1: A2(
						_folkertdev$one_true_path_experiment$Geometry_Ellipse$derivativeAt,
						t,
						_folkertdev$one_true_path_experiment$Geometry_Ellipse$endpointToCenter(_p4._0))
				};
		}
	});
var _folkertdev$one_true_path_experiment$Segment$at = F2(
	function (t, segment) {
		var _p5 = segment;
		switch (_p5.ctor) {
			case 'LineSegment':
				return _opensolid$geometry$OpenSolid_Point2d$coordinates(
					A2(_opensolid$geometry$OpenSolid_LineSegment2d$interpolate, _p5._0, t));
			case 'Quadratic':
				return _opensolid$geometry$OpenSolid_Point2d$coordinates(
					A2(_opensolid$geometry$OpenSolid_QuadraticSpline2d$pointOn, _p5._0, t));
			case 'Cubic':
				return _opensolid$geometry$OpenSolid_Point2d$coordinates(
					A2(_opensolid$geometry$OpenSolid_CubicSpline2d$pointOn, _p5._0, t));
			default:
				return A2(
					_folkertdev$one_true_path_experiment$Geometry_Ellipse$at,
					t,
					_folkertdev$one_true_path_experiment$Geometry_Ellipse$endpointToCenter(_p5._0));
		}
	});
var _folkertdev$one_true_path_experiment$Segment$traverse = F3(
	function (folder, initial, elements) {
		return _elm_lang$core$List$reverse(
			_elm_lang$core$Tuple$second(
				A3(
					_elm_lang$core$List$foldl,
					folder,
					{
						ctor: '_Tuple2',
						_0: initial,
						_1: {ctor: '[]'}
					},
					elements)));
	});
var _folkertdev$one_true_path_experiment$Segment$finalPoint = function (segment) {
	return _opensolid$geometry$OpenSolid_Point2d$coordinates(
		function () {
			var _p6 = segment;
			switch (_p6.ctor) {
				case 'LineSegment':
					return _opensolid$geometry$OpenSolid_LineSegment2d$endPoint(_p6._0);
				case 'Quadratic':
					return _opensolid$geometry$OpenSolid_QuadraticSpline2d$endPoint(_p6._0);
				case 'Cubic':
					return _opensolid$geometry$OpenSolid_CubicSpline2d$endPoint(_p6._0);
				default:
					return _opensolid$geometry$OpenSolid_Point2d$fromCoordinates(_p6._0.end);
			}
		}());
};
var _folkertdev$one_true_path_experiment$Segment$firstPoint = function (segment) {
	return _opensolid$geometry$OpenSolid_Point2d$coordinates(
		function () {
			var _p7 = segment;
			switch (_p7.ctor) {
				case 'LineSegment':
					return _opensolid$geometry$OpenSolid_LineSegment2d$startPoint(_p7._0);
				case 'Quadratic':
					return _opensolid$geometry$OpenSolid_QuadraticSpline2d$startPoint(_p7._0);
				case 'Cubic':
					return _opensolid$geometry$OpenSolid_CubicSpline2d$startPoint(_p7._0);
				default:
					return _opensolid$geometry$OpenSolid_Point2d$fromCoordinates(_p7._0.start);
			}
		}());
};
var _folkertdev$one_true_path_experiment$Segment$toCursorState = function (segment) {
	var vec4map = F2(
		function (f, _p8) {
			var _p9 = _p8;
			return {
				ctor: '_Tuple4',
				_0: f(_p9._0),
				_1: f(_p9._1),
				_2: f(_p9._2),
				_3: f(_p9._3)
			};
		});
	var _p10 = segment;
	switch (_p10.ctor) {
		case 'Cubic':
			var _p11 = A2(
				vec4map,
				_opensolid$geometry$OpenSolid_Point2d$coordinates,
				_opensolid$geometry$OpenSolid_CubicSpline2d$controlPoints(_p10._0));
			var start = _p11._0;
			var control = _p11._2;
			var end = _p11._3;
			return {
				start: start,
				previousControlPoint: _elm_lang$core$Maybe$Just(control),
				cursor: end
			};
		case 'Quadratic':
			var _p12 = A2(
				_Zinggi$elm_webgl_math$Vector3$map,
				_opensolid$geometry$OpenSolid_Point2d$coordinates,
				_opensolid$geometry$OpenSolid_QuadraticSpline2d$controlPoints(_p10._0));
			var start = _p12._0;
			var control = _p12._1;
			var end = _p12._2;
			return {
				start: start,
				previousControlPoint: _elm_lang$core$Maybe$Just(control),
				cursor: end
			};
		default:
			return {
				start: _folkertdev$one_true_path_experiment$Segment$firstPoint(segment),
				cursor: _folkertdev$one_true_path_experiment$Segment$finalPoint(segment),
				previousControlPoint: _elm_lang$core$Maybe$Nothing
			};
	}
};
var _folkertdev$one_true_path_experiment$Segment$toDrawTo = function (segment) {
	var _p13 = segment;
	switch (_p13.ctor) {
		case 'LineSegment':
			return _folkertdev$one_true_path_experiment$LowLevel_Command$lineTo(
				{
					ctor: '::',
					_0: _opensolid$geometry$OpenSolid_Point2d$coordinates(
						_opensolid$geometry$OpenSolid_LineSegment2d$endPoint(_p13._0)),
					_1: {ctor: '[]'}
				});
		case 'Quadratic':
			var _p14 = _opensolid$geometry$OpenSolid_QuadraticSpline2d$controlPoints(_p13._0);
			var start = _p14._0;
			var c1 = _p14._1;
			var end = _p14._2;
			return _folkertdev$one_true_path_experiment$LowLevel_Command$quadraticCurveTo(
				{
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: _opensolid$geometry$OpenSolid_Point2d$coordinates(c1),
						_1: _opensolid$geometry$OpenSolid_Point2d$coordinates(end)
					},
					_1: {ctor: '[]'}
				});
		case 'Cubic':
			var _p15 = _opensolid$geometry$OpenSolid_CubicSpline2d$controlPoints(_p13._0);
			var start = _p15._0;
			var c1 = _p15._1;
			var c2 = _p15._2;
			var end = _p15._3;
			return _folkertdev$one_true_path_experiment$LowLevel_Command$cubicCurveTo(
				{
					ctor: '::',
					_0: {
						ctor: '_Tuple3',
						_0: _opensolid$geometry$OpenSolid_Point2d$coordinates(c1),
						_1: _opensolid$geometry$OpenSolid_Point2d$coordinates(c2),
						_2: _opensolid$geometry$OpenSolid_Point2d$coordinates(end)
					},
					_1: {ctor: '[]'}
				});
		default:
			return _folkertdev$one_true_path_experiment$LowLevel_Command$EllipticalArc(
				{
					ctor: '::',
					_0: {target: _p13._0.end, radii: _p13._0.radii, xAxisRotate: _p13._0.xAxisRotate * (180 / _elm_lang$core$Basics$pi), arcFlag: _p13._0.arcFlag, direction: _p13._0.direction},
					_1: {ctor: '[]'}
				});
	}
};
var _folkertdev$one_true_path_experiment$Segment$Arc = function (a) {
	return {ctor: 'Arc', _0: a};
};
var _folkertdev$one_true_path_experiment$Segment$arc = F2(
	function (start, _p16) {
		var _p17 = _p16;
		return _folkertdev$one_true_path_experiment$Segment$Arc(
			{start: start, radii: _p17.radii, xAxisRotate: _p17.xAxisRotate, direction: _p17.direction, arcFlag: _p17.arcFlag, end: _p17.target});
	});
var _folkertdev$one_true_path_experiment$Segment$Cubic = function (a) {
	return {ctor: 'Cubic', _0: a};
};
var _folkertdev$one_true_path_experiment$Segment$cubic = F4(
	function (start, c1, c2, end) {
		return _folkertdev$one_true_path_experiment$Segment$Cubic(
			_opensolid$geometry$OpenSolid_CubicSpline2d$fromControlPoints(
				{
					ctor: '_Tuple4',
					_0: _opensolid$geometry$OpenSolid_Point2d$fromCoordinates(start),
					_1: _opensolid$geometry$OpenSolid_Point2d$fromCoordinates(c1),
					_2: _opensolid$geometry$OpenSolid_Point2d$fromCoordinates(c2),
					_3: _opensolid$geometry$OpenSolid_Point2d$fromCoordinates(end)
				}));
	});
var _folkertdev$one_true_path_experiment$Segment$Quadratic = function (a) {
	return {ctor: 'Quadratic', _0: a};
};
var _folkertdev$one_true_path_experiment$Segment$quadratic = F3(
	function (start, c1, end) {
		return _folkertdev$one_true_path_experiment$Segment$Quadratic(
			_opensolid$geometry$OpenSolid_QuadraticSpline2d$fromControlPoints(
				{
					ctor: '_Tuple3',
					_0: _opensolid$geometry$OpenSolid_Point2d$fromCoordinates(start),
					_1: _opensolid$geometry$OpenSolid_Point2d$fromCoordinates(c1),
					_2: _opensolid$geometry$OpenSolid_Point2d$fromCoordinates(end)
				}));
	});
var _folkertdev$one_true_path_experiment$Segment$LineSegment = function (a) {
	return {ctor: 'LineSegment', _0: a};
};
var _folkertdev$one_true_path_experiment$Segment$line = F2(
	function (from, to) {
		return _folkertdev$one_true_path_experiment$Segment$LineSegment(
			A2(
				_opensolid$geometry$OpenSolid_LineSegment2d$from,
				_opensolid$geometry$OpenSolid_Point2d$fromCoordinates(from),
				_opensolid$geometry$OpenSolid_Point2d$fromCoordinates(to)));
	});
var _folkertdev$one_true_path_experiment$Segment$reverse = function (segment) {
	var _p18 = segment;
	switch (_p18.ctor) {
		case 'LineSegment':
			return _folkertdev$one_true_path_experiment$Segment$LineSegment(
				_opensolid$geometry$OpenSolid_LineSegment2d$reverse(_p18._0));
		case 'Quadratic':
			return _folkertdev$one_true_path_experiment$Segment$Quadratic(
				_opensolid$geometry$OpenSolid_QuadraticSpline2d$reverse(_p18._0));
		case 'Cubic':
			return _folkertdev$one_true_path_experiment$Segment$Cubic(
				_opensolid$geometry$OpenSolid_CubicSpline2d$reverse(_p18._0));
		default:
			return _folkertdev$one_true_path_experiment$Segment$Arc(
				_folkertdev$one_true_path_experiment$Geometry_Ellipse$reverse(_p18._0));
	}
};
var _folkertdev$one_true_path_experiment$Segment$toSegment = F2(
	function (state, drawto) {
		var start = _opensolid$geometry$OpenSolid_Point2d$fromCoordinates(state.cursor);
		var _p19 = _opensolid$geometry$OpenSolid_Point2d$coordinates(start);
		var startX = _p19._0;
		var startY = _p19._1;
		var _p20 = drawto;
		switch (_p20.ctor) {
			case 'LineTo':
				var coordinates = A2(_elm_lang$core$List$map, _opensolid$geometry$OpenSolid_Point2d$fromCoordinates, _p20._0);
				return A3(
					_elm_lang$core$List$map2,
					F2(
						function (f, t) {
							return _folkertdev$one_true_path_experiment$Segment$LineSegment(
								A2(_opensolid$geometry$OpenSolid_LineSegment2d$from, f, t));
						}),
					{ctor: '::', _0: start, _1: coordinates},
					coordinates);
			case 'Horizontal':
				var coordinates = A2(
					_elm_lang$core$List$map,
					function (x) {
						return _opensolid$geometry$OpenSolid_Point2d$fromCoordinates(
							{ctor: '_Tuple2', _0: x, _1: startY});
					},
					_p20._0);
				return A3(
					_elm_lang$core$List$map2,
					F2(
						function (f, t) {
							return _folkertdev$one_true_path_experiment$Segment$LineSegment(
								A2(_opensolid$geometry$OpenSolid_LineSegment2d$from, f, t));
						}),
					{ctor: '::', _0: start, _1: coordinates},
					coordinates);
			case 'Vertical':
				var coordinates = A2(
					_elm_lang$core$List$map,
					function (y) {
						return _opensolid$geometry$OpenSolid_Point2d$fromCoordinates(
							{ctor: '_Tuple2', _0: startX, _1: y});
					},
					_p20._0);
				return A3(
					_elm_lang$core$List$map2,
					F2(
						function (f, t) {
							return _folkertdev$one_true_path_experiment$Segment$LineSegment(
								A2(_opensolid$geometry$OpenSolid_LineSegment2d$from, f, t));
						}),
					{ctor: '::', _0: start, _1: coordinates},
					coordinates);
			case 'CurveTo':
				var folder = F2(
					function (_p22, _p21) {
						var _p23 = _p22;
						var _p25 = _p23._2;
						var _p24 = _p21;
						return {
							ctor: '_Tuple2',
							_0: _p25,
							_1: {
								ctor: '::',
								_0: _folkertdev$one_true_path_experiment$Segment$Cubic(
									_opensolid$geometry$OpenSolid_CubicSpline2d$fromControlPoints(
										{ctor: '_Tuple4', _0: _p24._0, _1: _p23._0, _2: _p23._1, _3: _p25})),
								_1: _p24._1
							}
						};
					});
				var coordinates = A2(
					_elm_lang$core$List$map,
					_Zinggi$elm_webgl_math$Vector3$map(_opensolid$geometry$OpenSolid_Point2d$fromCoordinates),
					_p20._0);
				return A3(_folkertdev$one_true_path_experiment$Segment$traverse, folder, start, coordinates);
			case 'QuadraticBezierCurveTo':
				var folder = F2(
					function (_p27, _p26) {
						var _p28 = _p27;
						var _p30 = _p28._1;
						var _p29 = _p26;
						return {
							ctor: '_Tuple2',
							_0: _p30,
							_1: {
								ctor: '::',
								_0: _folkertdev$one_true_path_experiment$Segment$Quadratic(
									_opensolid$geometry$OpenSolid_QuadraticSpline2d$fromControlPoints(
										{ctor: '_Tuple3', _0: _p29._0, _1: _p28._0, _2: _p30})),
								_1: _p29._1
							}
						};
					});
				var coordinates = A2(
					_elm_lang$core$List$map,
					_Zinggi$elm_webgl_math$Vector2$map(_opensolid$geometry$OpenSolid_Point2d$fromCoordinates),
					_p20._0);
				return A3(_folkertdev$one_true_path_experiment$Segment$traverse, folder, start, coordinates);
			case 'EllipticalArc':
				var folder = F2(
					function (args, _p31) {
						var _p32 = _p31;
						return {
							ctor: '_Tuple2',
							_0: args.target,
							_1: {
								ctor: '::',
								_0: _folkertdev$one_true_path_experiment$Segment$Arc(
									{
										start: _p32._0,
										end: args.target,
										radii: args.radii,
										xAxisRotate: _elm_lang$core$Basics$degrees(args.xAxisRotate),
										arcFlag: args.arcFlag,
										direction: args.direction
									}),
								_1: _p32._1
							}
						};
					});
				return A3(
					_folkertdev$one_true_path_experiment$Segment$traverse,
					folder,
					_opensolid$geometry$OpenSolid_Point2d$coordinates(start),
					_p20._0);
			default:
				return {ctor: '[]'};
		}
	});

var _folkertdev$one_true_path_experiment$SubPath$unsafeConcatenate = F2(
	function (a, b) {
		return _elm_lang$core$Native_Utils.update(
			a,
			{
				drawtos: A2(_folkertdev$elm_deque$Deque$append, a.drawtos, b.drawtos)
			});
	});
var _folkertdev$one_true_path_experiment$SubPath$pushBack = F2(
	function (drawto, data) {
		return _elm_lang$core$Native_Utils.update(
			data,
			{
				drawtos: A2(_folkertdev$elm_deque$Deque$pushBack, drawto, data.drawtos)
			});
	});
var _folkertdev$one_true_path_experiment$SubPath$firstPoint = function (_p0) {
	var _p1 = _p0;
	var _p2 = _p1.moveto;
	return _p2._0;
};
var _folkertdev$one_true_path_experiment$SubPath$toLowLevel = function (subpath) {
	var _p3 = subpath;
	if (_p3.ctor === 'Empty') {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		return _elm_lang$core$Maybe$Just(
			{
				moveto: _folkertdev$one_true_path_experiment$LowLevel_Command$toLowLevelMoveTo(_p3._0.moveto),
				drawtos: A2(
					_elm_lang$core$List$map,
					_folkertdev$one_true_path_experiment$LowLevel_Command$toLowLevelDrawTo,
					_folkertdev$elm_deque$Deque$toList(_p3._0.drawtos))
			});
	}
};
var _folkertdev$one_true_path_experiment$SubPath$compressHelper = function (drawtos) {
	var folder = F2(
		function (instruction, _p4) {
			var _p5 = _p4;
			var _p8 = _p5._0;
			var _p7 = _p5._1;
			var _p6 = A2(_folkertdev$one_true_path_experiment$LowLevel_Command$merge, _p8, instruction);
			if (_p6.ctor === 'Ok') {
				return {ctor: '_Tuple2', _0: _p6._0, _1: _p7};
			} else {
				return {
					ctor: '_Tuple2',
					_0: instruction,
					_1: {ctor: '::', _0: _p8, _1: _p7}
				};
			}
		});
	var _p9 = _folkertdev$elm_deque$Deque$toList(drawtos);
	if (_p9.ctor === '[]') {
		return _folkertdev$elm_deque$Deque$empty;
	} else {
		return _folkertdev$elm_deque$Deque$fromList(
			_elm_lang$core$List$reverse(
				A2(
					_elm_lang$core$Basics$uncurry,
					F2(
						function (x, y) {
							return {ctor: '::', _0: x, _1: y};
						}),
					A3(
						_elm_lang$core$List$foldl,
						folder,
						{
							ctor: '_Tuple2',
							_0: _p9._0,
							_1: {ctor: '[]'}
						},
						_p9._1))));
	}
};
var _folkertdev$one_true_path_experiment$SubPath$toSegments = function (subpath) {
	var _p10 = subpath;
	if (_p10.ctor === 'Empty') {
		return {ctor: '[]'};
	} else {
		var _p11 = _p10._0.moveto;
		var _p15 = _p11._0;
		var folder = F2(
			function (drawto, _p12) {
				var _p13 = _p12;
				var _p14 = _p13._0;
				var newSegments = A2(_folkertdev$one_true_path_experiment$Segment$toSegment, _p14, drawto);
				var finalNewSegment = A2(
					_elm_lang$core$Maybe$withDefault,
					_p14,
					A2(
						_elm_lang$core$Maybe$map,
						_folkertdev$one_true_path_experiment$Segment$toCursorState,
						_elm_community$list_extra$List_Extra$last(newSegments)));
				return {
					ctor: '_Tuple2',
					_0: finalNewSegment,
					_1: A2(_elm_lang$core$Basics_ops['++'], _p13._1, newSegments)
				};
			});
		var cursorState = {start: _p15, cursor: _p15, previousControlPoint: _elm_lang$core$Maybe$Nothing};
		return _elm_lang$core$Tuple$second(
			A3(
				_elm_lang$core$List$foldl,
				folder,
				{
					ctor: '_Tuple2',
					_0: cursorState,
					_1: {ctor: '[]'}
				},
				_folkertdev$elm_deque$Deque$toList(_p10._0.drawtos)));
	}
};
var _folkertdev$one_true_path_experiment$SubPath$finalCursorState = function (_p16) {
	var _p17 = _p16;
	var _p18 = _p17.moveto;
	var start = _p18._0;
	var initial = {start: start, cursor: start, previousControlPoint: _elm_lang$core$Maybe$Nothing};
	return A3(_folkertdev$elm_deque$Deque$foldl, _folkertdev$one_true_path_experiment$LowLevel_Command$updateCursorState, initial, _p17.drawtos);
};
var _folkertdev$one_true_path_experiment$SubPath$finalPoint = function (_p19) {
	return function (_) {
		return _.cursor;
	}(
		_folkertdev$one_true_path_experiment$SubPath$finalCursorState(_p19));
};
var _folkertdev$one_true_path_experiment$SubPath$mapCoordinateInstructions = F2(
	function (f, _p20) {
		var _p21 = _p20;
		var _p22 = _p21.moveto;
		return {
			moveto: _folkertdev$one_true_path_experiment$LowLevel_Command$MoveTo(
				f(_p22._0)),
			drawtos: A2(
				_folkertdev$elm_deque$Deque$map,
				_folkertdev$one_true_path_experiment$LowLevel_Command$mapCoordinateDrawTo(f),
				_p21.drawtos)
		};
	});
var _folkertdev$one_true_path_experiment$SubPath$mapWithCursorState = F2(
	function (mapDrawTo, subpath) {
		var _p23 = subpath;
		if (_p23.ctor === 'Empty') {
			return {ctor: '[]'};
		} else {
			var folder = F2(
				function (drawto, _p24) {
					var _p25 = _p24;
					var _p26 = _p25._0;
					var $new = A2(
						_folkertdev$one_true_path_experiment$LowLevel_Command$updateCursorState,
						drawto,
						{start: _p26.start, cursor: _p26.cursor, previousControlPoint: _elm_lang$core$Maybe$Nothing});
					return {
						ctor: '_Tuple2',
						_0: $new,
						_1: {
							ctor: '::',
							_0: A2(mapDrawTo, _p26, drawto),
							_1: _p25._1
						}
					};
				});
			var _p27 = _p23._0.moveto;
			var start = _p27._0;
			return _elm_lang$core$List$reverse(
				_elm_lang$core$Tuple$second(
					A3(
						_folkertdev$elm_deque$Deque$foldl,
						folder,
						{
							ctor: '_Tuple2',
							_0: {start: start, cursor: start, previousControlPoint: _elm_lang$core$Maybe$Nothing},
							_1: {ctor: '[]'}
						},
						_p23._0.drawtos)));
		}
	});
var _folkertdev$one_true_path_experiment$SubPath$toString = function (subpath) {
	return A2(
		_elm_lang$core$Maybe$withDefault,
		'',
		A2(
			_elm_lang$core$Maybe$map,
			function (_p28) {
				return _folkertdev$svg_path_lowlevel$Path_LowLevel$toString(
					_elm_lang$core$List$singleton(_p28));
			},
			_folkertdev$one_true_path_experiment$SubPath$toLowLevel(subpath)));
};
var _folkertdev$one_true_path_experiment$SubPath$element = F2(
	function (path, attributes) {
		return A2(
			_elm_lang$svg$Svg$path,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$d(
					_folkertdev$one_true_path_experiment$SubPath$toString(path)),
				_1: attributes
			},
			{ctor: '[]'});
	});
var _folkertdev$one_true_path_experiment$SubPath$unwrap = function (subpath) {
	var _p29 = subpath;
	if (_p29.ctor === 'Empty') {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		var _p30 = _p29._0;
		return _elm_lang$core$Maybe$Just(
			_elm_lang$core$Native_Utils.update(
				_p30,
				{
					drawtos: _folkertdev$elm_deque$Deque$toList(_p30.drawtos)
				}));
	}
};
var _folkertdev$one_true_path_experiment$SubPath$Instructions = F2(
	function (a, b) {
		return {moveto: a, drawtos: b};
	});
var _folkertdev$one_true_path_experiment$SubPath$Empty = {ctor: 'Empty'};
var _folkertdev$one_true_path_experiment$SubPath$empty = _folkertdev$one_true_path_experiment$SubPath$Empty;
var _folkertdev$one_true_path_experiment$SubPath$map = F2(
	function (f, subpath) {
		var _p31 = subpath;
		if (_p31.ctor === 'Empty') {
			return _folkertdev$one_true_path_experiment$SubPath$Empty;
		} else {
			return f(_p31._0);
		}
	});
var _folkertdev$one_true_path_experiment$SubPath$map2 = F3(
	function (f, sub1, sub2) {
		var _p32 = {ctor: '_Tuple2', _0: sub1, _1: sub2};
		if (_p32._0.ctor === 'Empty') {
			if (_p32._1.ctor === 'Empty') {
				return _folkertdev$one_true_path_experiment$SubPath$Empty;
			} else {
				return _p32._1;
			}
		} else {
			if (_p32._1.ctor === 'Empty') {
				return _p32._0;
			} else {
				return A2(f, _p32._0._0, _p32._1._0);
			}
		}
	});
var _folkertdev$one_true_path_experiment$SubPath$SubPath = function (a) {
	return {ctor: 'SubPath', _0: a};
};
var _folkertdev$one_true_path_experiment$SubPath$subpath = F2(
	function (moveto, drawtos) {
		return _folkertdev$one_true_path_experiment$SubPath$SubPath(
			{
				moveto: moveto,
				drawtos: _folkertdev$elm_deque$Deque$fromList(drawtos)
			});
	});
var _folkertdev$one_true_path_experiment$SubPath$fromSegments = function (segments) {
	var _p33 = segments;
	if (_p33.ctor === '[]') {
		return _folkertdev$one_true_path_experiment$SubPath$Empty;
	} else {
		return A2(
			_folkertdev$one_true_path_experiment$SubPath$subpath,
			_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(
				_folkertdev$one_true_path_experiment$Segment$firstPoint(_p33._0)),
			A2(_elm_lang$core$List$map, _folkertdev$one_true_path_experiment$Segment$toDrawTo, segments));
	}
};
var _folkertdev$one_true_path_experiment$SubPath$reverse = function () {
	var reverseMap = function (f) {
		return A2(
			_elm_lang$core$List$foldl,
			F2(
				function (elem, accum) {
					return {
						ctor: '::',
						_0: f(elem),
						_1: accum
					};
				}),
			{ctor: '[]'});
	};
	return function (_p34) {
		return _folkertdev$one_true_path_experiment$SubPath$fromSegments(
			A2(
				reverseMap,
				_folkertdev$one_true_path_experiment$Segment$reverse,
				_folkertdev$one_true_path_experiment$SubPath$toSegments(_p34)));
	};
}();
var _folkertdev$one_true_path_experiment$SubPath$fromLowLevel = function (_p35) {
	var _p36 = _p35;
	var _p37 = _p36.moveto;
	var _p38 = _p37._1;
	var initialCursorState = {start: _p38, cursor: _p38, previousControlPoint: _elm_lang$core$Maybe$Nothing};
	return A2(
		_folkertdev$one_true_path_experiment$SubPath$subpath,
		_folkertdev$one_true_path_experiment$LowLevel_Command$MoveTo(_p38),
		_elm_lang$core$Tuple$second(
			A2(_folkertdev$one_true_path_experiment$LowLevel_Command$fromLowLevelDrawTos, _p36.drawtos, initialCursorState)));
};
var _folkertdev$one_true_path_experiment$SubPath$continue = function () {
	var helper = F2(
		function (right, left) {
			var distance = A2(
				_Zinggi$elm_webgl_math$Vector2$sub,
				_folkertdev$one_true_path_experiment$SubPath$finalPoint(left),
				_folkertdev$one_true_path_experiment$SubPath$firstPoint(right));
			return _folkertdev$one_true_path_experiment$SubPath$SubPath(
				A2(
					_folkertdev$one_true_path_experiment$SubPath$unsafeConcatenate,
					left,
					A2(
						_folkertdev$one_true_path_experiment$SubPath$mapCoordinateInstructions,
						_Zinggi$elm_webgl_math$Vector2$add(distance),
						right)));
		});
	return _folkertdev$one_true_path_experiment$SubPath$map2(helper);
}();
var _folkertdev$one_true_path_experiment$SubPath$connect = function () {
	var helper = F2(
		function (right, left) {
			return _folkertdev$one_true_path_experiment$SubPath$SubPath(
				A2(
					_folkertdev$one_true_path_experiment$SubPath$unsafeConcatenate,
					A2(
						_folkertdev$one_true_path_experiment$SubPath$pushBack,
						_folkertdev$one_true_path_experiment$LowLevel_Command$lineTo(
							{
								ctor: '::',
								_0: _folkertdev$one_true_path_experiment$SubPath$firstPoint(right),
								_1: {ctor: '[]'}
							}),
						left),
					right));
		});
	return _folkertdev$one_true_path_experiment$SubPath$map2(helper);
}();
var _folkertdev$one_true_path_experiment$SubPath$close = function (subpath) {
	var _p39 = subpath;
	if (_p39.ctor === 'Empty') {
		return _folkertdev$one_true_path_experiment$SubPath$Empty;
	} else {
		var _p41 = _p39._0.drawtos;
		var _p40 = _folkertdev$elm_deque$Deque$popBack(_p41);
		if (((_p40.ctor === '_Tuple2') && (_p40._0.ctor === 'Just')) && (_p40._0._0.ctor === 'ClosePath')) {
			return subpath;
		} else {
			return _folkertdev$one_true_path_experiment$SubPath$SubPath(
				{
					moveto: _p39._0.moveto,
					drawtos: A2(_folkertdev$elm_deque$Deque$pushBack, _folkertdev$one_true_path_experiment$LowLevel_Command$closePath, _p41)
				});
		}
	}
};
var _folkertdev$one_true_path_experiment$SubPath$mapCoordinate = F2(
	function (f, subpath) {
		var _p42 = subpath;
		if (_p42.ctor === 'SubPath') {
			var _p43 = _p42._0.moveto;
			return _folkertdev$one_true_path_experiment$SubPath$SubPath(
				{
					moveto: _folkertdev$one_true_path_experiment$LowLevel_Command$MoveTo(
						f(_p43._0)),
					drawtos: A2(
						_folkertdev$elm_deque$Deque$map,
						_folkertdev$one_true_path_experiment$LowLevel_Command$mapCoordinateDrawTo(f),
						_p42._0.drawtos)
				});
		} else {
			return _folkertdev$one_true_path_experiment$SubPath$Empty;
		}
	});
var _folkertdev$one_true_path_experiment$SubPath$translate = F2(
	function (vec, subpath) {
		return A2(
			_folkertdev$one_true_path_experiment$SubPath$mapCoordinate,
			_Zinggi$elm_webgl_math$Vector2$add(vec),
			subpath);
	});
var _folkertdev$one_true_path_experiment$SubPath$rotate = F2(
	function (angle, subpath) {
		var _p44 = subpath;
		if (_p44.ctor === 'Empty') {
			return _folkertdev$one_true_path_experiment$SubPath$Empty;
		} else {
			var rotate = F2(
				function (angle, point) {
					return function (_p45) {
						var _p46 = _p45;
						return {ctor: '_Tuple2', _0: _p46._0, _1: _p46._1};
					}(
						A2(
							_Zinggi$elm_webgl_math$Matrix4$transform,
							A2(
								_Zinggi$elm_webgl_math$Matrix4$makeRotate,
								angle,
								{ctor: '_Tuple3', _0: 0, _1: 0, _2: 1}),
							A3(_elm_lang$core$Basics$flip, _Zinggi$elm_webgl_math$Vector3$fromV2, 0, point)));
				});
			var cleanFloat = function (v) {
				return function (v) {
					return v * 1.0e-12;
				}(
					_elm_lang$core$Basics$toFloat(
						_elm_lang$core$Basics$round(v * 1.0e12)));
			};
			var cleanVec2 = function (_p47) {
				var _p48 = _p47;
				return {
					ctor: '_Tuple2',
					_0: cleanFloat(_p48._0),
					_1: cleanFloat(_p48._1)
				};
			};
			var _p49 = _p44._0.moveto;
			var firstPoint = _p49._0;
			var transform = function (point) {
				return A2(
					_Zinggi$elm_webgl_math$Vector2$add,
					firstPoint,
					cleanVec2(
						A2(
							rotate,
							angle,
							A3(_elm_lang$core$Basics$flip, _Zinggi$elm_webgl_math$Vector2$sub, firstPoint, point))));
			};
			return A2(_folkertdev$one_true_path_experiment$SubPath$mapCoordinate, transform, subpath);
		}
	});
var _folkertdev$one_true_path_experiment$SubPath$continueSmooth = F2(
	function (right, left) {
		var _p50 = _elm_community$list_extra$List_Extra$last(
			_folkertdev$one_true_path_experiment$SubPath$toSegments(left));
		if (_p50.ctor === 'Nothing') {
			return right;
		} else {
			var _p51 = _elm_lang$core$List$head(
				_folkertdev$one_true_path_experiment$SubPath$toSegments(right));
			if (_p51.ctor === 'Nothing') {
				return left;
			} else {
				var angle = _elm_lang$core$Basics$negate(
					A2(_folkertdev$one_true_path_experiment$Segment$angle, _p50._0, _p51._0));
				return A2(
					_folkertdev$one_true_path_experiment$SubPath$continue,
					A2(_folkertdev$one_true_path_experiment$SubPath$rotate, angle, right),
					left);
			}
		}
	});
var _folkertdev$one_true_path_experiment$SubPath$scale = F2(
	function (vec, subpath) {
		var _p52 = subpath;
		if (_p52.ctor === 'Empty') {
			return _folkertdev$one_true_path_experiment$SubPath$Empty;
		} else {
			var _p53 = _p52._0.moveto;
			var firstPoint = _p53._0;
			var transform = function (point) {
				return A2(
					_Zinggi$elm_webgl_math$Vector2$add,
					firstPoint,
					function (_p54) {
						var _p55 = _p54;
						return {ctor: '_Tuple2', _0: _p55._0, _1: _p55._1};
					}(
						A2(
							_Zinggi$elm_webgl_math$Matrix4$transform,
							_Zinggi$elm_webgl_math$Matrix4$makeScale(
								A2(_Zinggi$elm_webgl_math$Vector3$fromV2, vec, 0)),
							A3(
								_elm_lang$core$Basics$flip,
								_Zinggi$elm_webgl_math$Vector3$fromV2,
								0,
								A3(_elm_lang$core$Basics$flip, _Zinggi$elm_webgl_math$Vector2$sub, firstPoint, point)))));
			};
			return A2(_folkertdev$one_true_path_experiment$SubPath$mapCoordinate, transform, subpath);
		}
	});
var _folkertdev$one_true_path_experiment$SubPath$compress = function (subpath) {
	var _p56 = subpath;
	if (_p56.ctor === 'Empty') {
		return _folkertdev$one_true_path_experiment$SubPath$Empty;
	} else {
		var _p57 = _p56._0;
		return _folkertdev$one_true_path_experiment$SubPath$SubPath(
			_elm_lang$core$Native_Utils.update(
				_p57,
				{
					drawtos: _folkertdev$one_true_path_experiment$SubPath$compressHelper(_p57.drawtos)
				}));
	}
};

var _folkertdev$one_true_path_experiment$Internal_NaturalInterpolation$unsafeTail = function (_p0) {
	return A2(
		_elm_lang$core$Maybe$withDefault,
		{ctor: '[]'},
		_elm_lang$core$List$tail(_p0));
};
var _folkertdev$one_true_path_experiment$Internal_NaturalInterpolation$unsafeInit = function (_p1) {
	return A2(
		_elm_lang$core$Maybe$withDefault,
		{ctor: '[]'},
		_elm_community$list_extra$List_Extra$init(_p1));
};
var _folkertdev$one_true_path_experiment$Internal_NaturalInterpolation$step3 = F2(
	function (points, _p2) {
		var _p3 = _p2;
		var _p7 = _p3._2;
		var _p6 = _p3._1;
		var helper = F3(
			function (finalR, finalB, finalX) {
				var scanner = F2(
					function (_p4, prevA) {
						var _p5 = _p4;
						return (_p5._1 - prevA) / _p5._0;
					});
				var finalA = finalR / finalB;
				var a_ = A3(
					_elm_community$list_extra$List_Extra$scanr,
					scanner,
					finalA,
					A3(
						_elm_lang$core$List$map2,
						F2(
							function (v0, v1) {
								return {ctor: '_Tuple2', _0: v0, _1: v1};
							}),
						_folkertdev$one_true_path_experiment$Internal_NaturalInterpolation$unsafeInit(_p6),
						_folkertdev$one_true_path_experiment$Internal_NaturalInterpolation$unsafeInit(_p7)));
				var b_ = A2(
					_elm_lang$core$Basics_ops['++'],
					A3(
						_elm_lang$core$List$map2,
						F2(
							function (xx, aa) {
								return (2 * xx) - aa;
							}),
						_folkertdev$one_true_path_experiment$Internal_NaturalInterpolation$unsafeTail(points),
						_folkertdev$one_true_path_experiment$Internal_NaturalInterpolation$unsafeTail(a_)),
					{
						ctor: '::',
						_0: (finalX + finalA) / 2,
						_1: {ctor: '[]'}
					});
				return {ctor: '_Tuple2', _0: a_, _1: b_};
			});
		return A4(
			_elm_lang$core$Maybe$map3,
			helper,
			_elm_community$list_extra$List_Extra$last(_p7),
			_elm_community$list_extra$List_Extra$last(_p6),
			_elm_community$list_extra$List_Extra$last(points));
	});
var _folkertdev$one_true_path_experiment$Internal_NaturalInterpolation$step2 = function (_p8) {
	var _p9 = _p8;
	var _p20 = _p9._2;
	var _p19 = _p9._1;
	var _p18 = _p9._0;
	var _p10 = {ctor: '_Tuple2', _0: _p19, _1: _p20};
	if (((_p10.ctor === '_Tuple2') && (_p10._0.ctor === '::')) && (_p10._1.ctor === '::')) {
		var scanner = F2(
			function (_p12, _p11) {
				var _p13 = _p12;
				var _p16 = _p13._0;
				var _p14 = _p11;
				var _p15 = _p14._0;
				return {ctor: '_Tuple2', _0: _p13._1 - (_p16 / _p15), _1: _p13._2 - ((_p16 / _p15) * _p14._1)};
			});
		var _p17 = _elm_lang$core$List$unzip(
			A2(
				_elm_lang$core$List$drop,
				1,
				A3(
					_elm_lang$core$List$scanl,
					scanner,
					{ctor: '_Tuple2', _0: _p10._0._0, _1: _p10._1._0},
					A4(
						_elm_lang$core$List$map3,
						F3(
							function (v0, v1, v2) {
								return {ctor: '_Tuple3', _0: v0, _1: v1, _2: v2};
							}),
						_p18,
						_p19,
						_p20))));
		var b_ = _p17._0;
		var r_ = _p17._1;
		return _elm_lang$core$Maybe$Just(
			{ctor: '_Tuple3', _0: _p18, _1: b_, _2: r_});
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _folkertdev$one_true_path_experiment$Internal_NaturalInterpolation$step1 = function (coordinates) {
	var _p21 = coordinates;
	if ((_p21.ctor === '::') && (_p21._1.ctor === '::')) {
		var _p28 = _p21._1._0;
		var _p27 = _p21._0;
		var _p26 = _p21._1._1;
		var _p22 = A3(
			_elm_lang$core$List$foldl,
			F2(
				function (elem, _p23) {
					var _p24 = _p23;
					return {ctor: '_Tuple2', _0: _p24._1, _1: elem};
				}),
			{ctor: '_Tuple2', _0: _p27, _1: _p28},
			_p26);
		var butFinal = _p22._0;
		var $final = _p22._1;
		var r = {
			ctor: '::',
			_0: _p27 + (2 * _p28),
			_1: A3(
				_elm_lang$core$List$map2,
				F2(
					function (current, next) {
						return (4 * current) + (2 * next);
					}),
				{ctor: '::', _0: _p28, _1: _p26},
				_p26)
		};
		var n = _elm_lang$core$List$length(coordinates) - 1;
		var a = {
			ctor: '::',
			_0: 0,
			_1: A2(
				_elm_lang$core$Basics_ops['++'],
				A2(_elm_lang$core$List$repeat, n - 2, 1),
				{
					ctor: '::',
					_0: 2,
					_1: {ctor: '[]'}
				})
		};
		var b = {
			ctor: '::',
			_0: 2,
			_1: A2(
				_elm_lang$core$Basics_ops['++'],
				A2(_elm_lang$core$List$repeat, n - 2, 4),
				{
					ctor: '::',
					_0: 7,
					_1: {ctor: '[]'}
				})
		};
		var r_ = A2(
			_elm_lang$core$Maybe$withDefault,
			r,
			A3(
				_elm_community$list_extra$List_Extra$updateAt,
				n - 1,
				function (_p25) {
					return (8 * butFinal) + $final;
				},
				r));
		return _elm_lang$core$Maybe$Just(
			{ctor: '_Tuple3', _0: a, _1: b, _2: r_});
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _folkertdev$one_true_path_experiment$Internal_NaturalInterpolation$controlPoints = function (points) {
	return A2(
		_elm_lang$core$Maybe$andThen,
		_folkertdev$one_true_path_experiment$Internal_NaturalInterpolation$step3(points),
		A2(
			_elm_lang$core$Maybe$andThen,
			_folkertdev$one_true_path_experiment$Internal_NaturalInterpolation$step2,
			_folkertdev$one_true_path_experiment$Internal_NaturalInterpolation$step1(points)));
};
var _folkertdev$one_true_path_experiment$Internal_NaturalInterpolation$naturalControlPoints = function (points) {
	var _p29 = _elm_lang$core$List$unzip(points);
	var xs = _p29._0;
	var ys = _p29._1;
	var _p30 = A3(
		_elm_lang$core$Maybe$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		_folkertdev$one_true_path_experiment$Internal_NaturalInterpolation$controlPoints(xs),
		_folkertdev$one_true_path_experiment$Internal_NaturalInterpolation$controlPoints(ys));
	if (_p30.ctor === 'Just') {
		var pb = A3(
			_elm_lang$core$List$map2,
			F2(
				function (v0, v1) {
					return {ctor: '_Tuple2', _0: v0, _1: v1};
				}),
			_p30._0._0._1,
			_p30._0._1._1);
		var pa = A3(
			_elm_lang$core$List$map2,
			F2(
				function (v0, v1) {
					return {ctor: '_Tuple2', _0: v0, _1: v1};
				}),
			_p30._0._0._0,
			_p30._0._1._0);
		return A4(
			_elm_lang$core$List$map3,
			F3(
				function (v0, v1, v2) {
					return {ctor: '_Tuple3', _0: v0, _1: v1, _2: v2};
				}),
			pa,
			pb,
			A2(_elm_lang$core$List$drop, 1, points));
	} else {
		return {ctor: '[]'};
	}
};

var _folkertdev$one_true_path_experiment$Curve$repeatFinalPoint = function (items) {
	var _p0 = _elm_community$list_extra$List_Extra$last(items);
	if (_p0.ctor === 'Nothing') {
		return items;
	} else {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			items,
			{
				ctor: '::',
				_0: _p0._0,
				_1: {ctor: '[]'}
			});
	}
};
var _folkertdev$one_true_path_experiment$Curve$repeatFirstPoint = function (items) {
	var _p1 = items;
	if (_p1.ctor === '[]') {
		return {ctor: '[]'};
	} else {
		return {ctor: '::', _0: _p1._0, _1: items};
	}
};
var _folkertdev$one_true_path_experiment$Curve$natural = function (points) {
	var _p2 = points;
	if (_p2.ctor === '[]') {
		return _folkertdev$one_true_path_experiment$SubPath$empty;
	} else {
		if (_p2._1.ctor === '[]') {
			return _folkertdev$one_true_path_experiment$SubPath$empty;
		} else {
			if (_p2._1._1.ctor === '[]') {
				return A2(
					_folkertdev$one_true_path_experiment$SubPath$subpath,
					_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p2._0),
					{
						ctor: '::',
						_0: _folkertdev$one_true_path_experiment$LowLevel_Command$lineTo(
							{
								ctor: '::',
								_0: _p2._1._0,
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					});
			} else {
				return A2(
					_folkertdev$one_true_path_experiment$SubPath$subpath,
					_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p2._0),
					{
						ctor: '::',
						_0: _folkertdev$one_true_path_experiment$LowLevel_Command$cubicCurveTo(
							_folkertdev$one_true_path_experiment$Internal_NaturalInterpolation$naturalControlPoints(points)),
						_1: {ctor: '[]'}
					});
			}
		}
	}
};
var _folkertdev$one_true_path_experiment$Curve$toH = F2(
	function (h0, h1) {
		return _elm_lang$core$Native_Utils.eq(h0, 0) ? ((_elm_lang$core$Native_Utils.cmp(h1, 0) < 0) ? (0 * -1) : h1) : h0;
	});
var _folkertdev$one_true_path_experiment$Curve$monotonePoint = F4(
	function (_p4, _p3, t0, t1) {
		var _p5 = _p4;
		var _p9 = _p5._0;
		var _p6 = _p3;
		var _p8 = _p6._1;
		var _p7 = _p6._0;
		var dx = (_p7 - _p9) / 3;
		return {
			ctor: '_Tuple3',
			_0: {ctor: '_Tuple2', _0: _p9 + dx, _1: _p5._1 + (dx * t0)},
			_1: {ctor: '_Tuple2', _0: _p7 - dx, _1: _p8 - (dx * t1)},
			_2: {ctor: '_Tuple2', _0: _p7, _1: _p8}
		};
	});
var _folkertdev$one_true_path_experiment$Curve$slope2 = F3(
	function (p0, p1, t) {
		var _p10 = A2(_Zinggi$elm_webgl_math$Vector2$sub, p0, p1);
		var dx = _p10._0;
		var dy = _p10._1;
		return (!_elm_lang$core$Native_Utils.eq(dx, 0)) ? ((((3 * dy) / dx) - t) / 2) : t;
	});
var _folkertdev$one_true_path_experiment$Curve$catmullRomDistance = F3(
	function (alpha, p1, p2) {
		var l23_2a = Math.pow(
			_Zinggi$elm_webgl_math$Vector2$lengthSquared(
				A2(_Zinggi$elm_webgl_math$Vector2$sub, p1, p2)),
			alpha);
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Basics$sqrt(l23_2a),
			_1: l23_2a
		};
	});
var _folkertdev$one_true_path_experiment$Curve$cardinalPoint = F5(
	function (k, p0, p1, p2, p) {
		return {
			ctor: '_Tuple3',
			_0: A2(
				_Zinggi$elm_webgl_math$Vector2$add,
				p1,
				A2(
					_Zinggi$elm_webgl_math$Vector2$scale,
					k,
					A2(_Zinggi$elm_webgl_math$Vector2$sub, p2, p0))),
			_1: A2(
				_Zinggi$elm_webgl_math$Vector2$add,
				p2,
				A2(
					_Zinggi$elm_webgl_math$Vector2$scale,
					k,
					A2(_Zinggi$elm_webgl_math$Vector2$sub, p1, p))),
			_2: p2
		};
	});
var _folkertdev$one_true_path_experiment$Curve$cardinal = F2(
	function (tension, points) {
		var k = (1 - tension) / 6;
		var helper = function (points) {
			var _p11 = points;
			if (((_p11.ctor === '::') && (_p11._1.ctor === '::')) && (_p11._1._1.ctor === '::')) {
				if (_p11._1._1._1.ctor === '::') {
					var _p14 = _p11._1._1._1._0;
					var _p13 = _p11._1._1._0;
					var _p12 = _p11._1._0;
					return {
						ctor: '::',
						_0: A5(_folkertdev$one_true_path_experiment$Curve$cardinalPoint, k, _p11._0, _p12, _p13, _p14),
						_1: helper(
							{
								ctor: '::',
								_0: _p12,
								_1: {
									ctor: '::',
									_0: _p13,
									_1: {ctor: '::', _0: _p14, _1: _p11._1._1._1._1}
								}
							})
					};
				} else {
					var _p15 = _p11._1._0;
					return {
						ctor: '::',
						_0: A5(_folkertdev$one_true_path_experiment$Curve$cardinalPoint, k, _p11._0, _p15, _p11._1._1._0, _p15),
						_1: {ctor: '[]'}
					};
				}
			} else {
				return {ctor: '[]'};
			}
		};
		var _p16 = points;
		if ((_p16.ctor === '::') && (_p16._1.ctor === '::')) {
			if (_p16._1._1.ctor === '[]') {
				return A2(
					_folkertdev$one_true_path_experiment$SubPath$subpath,
					_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p16._0),
					{
						ctor: '::',
						_0: _folkertdev$one_true_path_experiment$LowLevel_Command$lineTo(
							{
								ctor: '::',
								_0: _p16._1._0,
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					});
			} else {
				var _p18 = _p16._1._0;
				var _p17 = _p16._0;
				return A2(
					_folkertdev$one_true_path_experiment$SubPath$subpath,
					_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p17),
					{
						ctor: '::',
						_0: _folkertdev$one_true_path_experiment$LowLevel_Command$cubicCurveTo(
							{
								ctor: '::',
								_0: A5(_folkertdev$one_true_path_experiment$Curve$cardinalPoint, k, _p17, _p18, _p18, _p16._1._1._0),
								_1: helper(points)
							}),
						_1: {ctor: '[]'}
					});
			}
		} else {
			return _folkertdev$one_true_path_experiment$SubPath$empty;
		}
	});
var _folkertdev$one_true_path_experiment$Curve$cardinalOpen = F2(
	function (tension, points) {
		var k = (1 - tension) / 6;
		var _p19 = points;
		if ((((_p19.ctor === '::') && (_p19._1.ctor === '::')) && (_p19._1._1.ctor === '::')) && (_p19._1._1._1.ctor === '::')) {
			var _p23 = _p19._1._1._1._1;
			var _p22 = _p19._1._1._1._0;
			var _p21 = _p19._1._1._0;
			var _p20 = _p19._1._0;
			return A2(
				_folkertdev$one_true_path_experiment$SubPath$subpath,
				_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p20),
				_elm_lang$core$List$singleton(
					_folkertdev$one_true_path_experiment$LowLevel_Command$cubicCurveTo(
						A5(
							_elm_lang$core$List$map4,
							_folkertdev$one_true_path_experiment$Curve$cardinalPoint(k),
							{
								ctor: '::',
								_0: _p19._0,
								_1: {
									ctor: '::',
									_0: _p20,
									_1: {
										ctor: '::',
										_0: _p21,
										_1: {ctor: '::', _0: _p22, _1: _p23}
									}
								}
							},
							{
								ctor: '::',
								_0: _p20,
								_1: {
									ctor: '::',
									_0: _p21,
									_1: {ctor: '::', _0: _p22, _1: _p23}
								}
							},
							{
								ctor: '::',
								_0: _p21,
								_1: {ctor: '::', _0: _p22, _1: _p23}
							},
							{ctor: '::', _0: _p22, _1: _p23}))));
		} else {
			return _folkertdev$one_true_path_experiment$SubPath$empty;
		}
	});
var _folkertdev$one_true_path_experiment$Curve$cardinalClosed = F2(
	function (tension, points) {
		var k = (1 - tension) / 6;
		var helper = F2(
			function (ending, points) {
				var _p24 = points;
				if (((_p24.ctor === '::') && (_p24._1.ctor === '::')) && (_p24._1._1.ctor === '::')) {
					if (_p24._1._1._1.ctor === '[]') {
						return A3(ending, _p24._0, _p24._1._0, _p24._1._1._0);
					} else {
						var _p27 = _p24._1._1._1._0;
						var _p26 = _p24._1._1._0;
						var _p25 = _p24._1._0;
						return {
							ctor: '::',
							_0: A5(_folkertdev$one_true_path_experiment$Curve$cardinalPoint, k, _p24._0, _p25, _p26, _p27),
							_1: A2(
								helper,
								ending,
								{
									ctor: '::',
									_0: _p25,
									_1: {
										ctor: '::',
										_0: _p26,
										_1: {ctor: '::', _0: _p27, _1: _p24._1._1._1._1}
									}
								})
						};
					}
				} else {
					return {ctor: '[]'};
				}
			});
		var _p28 = points;
		if (_p28.ctor === '[]') {
			return _folkertdev$one_true_path_experiment$SubPath$empty;
		} else {
			if (_p28._1.ctor === '[]') {
				return A2(
					_folkertdev$one_true_path_experiment$SubPath$subpath,
					_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p28._0),
					{
						ctor: '::',
						_0: _folkertdev$one_true_path_experiment$LowLevel_Command$closePath,
						_1: {ctor: '[]'}
					});
			} else {
				if (_p28._1._1.ctor === '[]') {
					return A2(
						_folkertdev$one_true_path_experiment$SubPath$subpath,
						_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p28._1._0),
						{
							ctor: '::',
							_0: _folkertdev$one_true_path_experiment$LowLevel_Command$lineTo(
								{
									ctor: '::',
									_0: _p28._0,
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: _folkertdev$one_true_path_experiment$LowLevel_Command$closePath,
								_1: {ctor: '[]'}
							}
						});
				} else {
					var _p30 = _p28._1._0;
					var _p29 = _p28._0;
					var end = F3(
						function (p0, p1, p2) {
							return {
								ctor: '::',
								_0: A5(_folkertdev$one_true_path_experiment$Curve$cardinalPoint, k, p0, p1, p2, _p29),
								_1: {
									ctor: '::',
									_0: A5(_folkertdev$one_true_path_experiment$Curve$cardinalPoint, k, p1, p2, _p29, _p30),
									_1: {
										ctor: '::',
										_0: A5(_folkertdev$one_true_path_experiment$Curve$cardinalPoint, k, p2, _p29, _p30, _p28._1._1._0),
										_1: {ctor: '[]'}
									}
								}
							};
						});
					return A2(
						_folkertdev$one_true_path_experiment$SubPath$subpath,
						_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p30),
						{
							ctor: '::',
							_0: _folkertdev$one_true_path_experiment$LowLevel_Command$cubicCurveTo(
								A2(helper, end, points)),
							_1: {ctor: '[]'}
						});
				}
			}
		}
	});
var _folkertdev$one_true_path_experiment$Curve$interpolateVec2 = F3(
	function (t, a, b) {
		return A2(
			_Zinggi$elm_webgl_math$Vector2$add,
			A2(_Zinggi$elm_webgl_math$Vector2$scale, t, a),
			A2(_Zinggi$elm_webgl_math$Vector2$scale, 1 - t, b));
	});
var _folkertdev$one_true_path_experiment$Curve$basisPoint = F3(
	function (p0, p1, p) {
		return {
			ctor: '_Tuple3',
			_0: A2(
				_Zinggi$elm_webgl_math$Vector2$divideBy,
				3,
				A2(
					_Zinggi$elm_webgl_math$Vector2$add,
					p1,
					A2(_Zinggi$elm_webgl_math$Vector2$scale, 2, p0))),
			_1: A2(
				_Zinggi$elm_webgl_math$Vector2$divideBy,
				3,
				A2(
					_Zinggi$elm_webgl_math$Vector2$add,
					p0,
					A2(_Zinggi$elm_webgl_math$Vector2$scale, 2, p1))),
			_2: A2(
				_Zinggi$elm_webgl_math$Vector2$divideBy,
				6,
				A2(
					_Zinggi$elm_webgl_math$Vector2$add,
					p,
					A2(
						_Zinggi$elm_webgl_math$Vector2$add,
						p0,
						A2(_Zinggi$elm_webgl_math$Vector2$scale, 4, p1))))
		};
	});
var _folkertdev$one_true_path_experiment$Curve$basis = function (points) {
	var commonCase = function (points) {
		var _p31 = points;
		if ((_p31.ctor === '::') && (_p31._1.ctor === '::')) {
			if (_p31._1._1.ctor === '[]') {
				var _p32 = _p31._1._0;
				return {
					ctor: '::',
					_0: _folkertdev$one_true_path_experiment$LowLevel_Command$cubicCurveTo(
						{
							ctor: '::',
							_0: A3(_folkertdev$one_true_path_experiment$Curve$basisPoint, _p31._0, _p32, _p32),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: _folkertdev$one_true_path_experiment$LowLevel_Command$lineTo(
							{
								ctor: '::',
								_0: _p32,
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				};
			} else {
				var _p34 = _p31._1._0;
				var _p33 = _p31._1._1._0;
				return {
					ctor: '::',
					_0: _folkertdev$one_true_path_experiment$LowLevel_Command$cubicCurveTo(
						{
							ctor: '::',
							_0: A3(_folkertdev$one_true_path_experiment$Curve$basisPoint, _p31._0, _p34, _p33),
							_1: {ctor: '[]'}
						}),
					_1: commonCase(
						{
							ctor: '::',
							_0: _p34,
							_1: {ctor: '::', _0: _p33, _1: _p31._1._1._1}
						})
				};
			}
		} else {
			return {ctor: '[]'};
		}
	};
	var _p35 = points;
	if ((_p35.ctor === '::') && (_p35._1.ctor === '::')) {
		if (_p35._1._1.ctor === '::') {
			var _p36 = _p35._0;
			var toFirst = A2(
				_Zinggi$elm_webgl_math$Vector2$divideBy,
				6,
				A2(
					_Zinggi$elm_webgl_math$Vector2$add,
					_p35._1._0,
					A2(_Zinggi$elm_webgl_math$Vector2$scale, 5, _p36)));
			return A2(
				_folkertdev$one_true_path_experiment$SubPath$subpath,
				_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p36),
				{
					ctor: '::',
					_0: _folkertdev$one_true_path_experiment$LowLevel_Command$lineTo(
						{
							ctor: '::',
							_0: toFirst,
							_1: {ctor: '[]'}
						}),
					_1: commonCase(points)
				});
		} else {
			return A2(
				_folkertdev$one_true_path_experiment$SubPath$subpath,
				_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p35._0),
				{
					ctor: '::',
					_0: _folkertdev$one_true_path_experiment$LowLevel_Command$lineTo(
						{
							ctor: '::',
							_0: _p35._1._0,
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				});
		}
	} else {
		return _folkertdev$one_true_path_experiment$SubPath$empty;
	}
};
var _folkertdev$one_true_path_experiment$Curve$bundle = F2(
	function (beta, points) {
		var _p37 = points;
		if (_p37.ctor === '[]') {
			return _folkertdev$one_true_path_experiment$SubPath$empty;
		} else {
			var _p38 = _p37._0;
			var deltas = A2(
				_Zinggi$elm_webgl_math$Vector2$sub,
				A2(
					_elm_lang$core$Maybe$withDefault,
					_p38,
					_elm_community$list_extra$List_Extra$last(_p37._1)),
				_p38);
			var j = _elm_lang$core$Basics$toFloat(
				_elm_lang$core$List$length(points) - 1);
			var helper = F2(
				function (i, p) {
					var t = _elm_lang$core$Basics$toFloat(i) / j;
					return A3(
						_folkertdev$one_true_path_experiment$Curve$interpolateVec2,
						beta,
						p,
						A2(
							_Zinggi$elm_webgl_math$Vector2$add,
							_p38,
							A2(_Zinggi$elm_webgl_math$Vector2$scale, t, deltas)));
				});
			return _folkertdev$one_true_path_experiment$Curve$basis(
				A2(_elm_lang$core$List$indexedMap, helper, points));
		}
	});
var _folkertdev$one_true_path_experiment$Curve$basisClosed = function (points) {
	var commonCase = F2(
		function (close, points) {
			var _p39 = points;
			if ((_p39.ctor === '::') && (_p39._1.ctor === '::')) {
				if (_p39._1._1.ctor === '[]') {
					return A2(close, _p39._0, _p39._1._0);
				} else {
					var _p41 = _p39._1._0;
					var _p40 = _p39._1._1._0;
					return {
						ctor: '::',
						_0: A3(_folkertdev$one_true_path_experiment$Curve$basisPoint, _p39._0, _p41, _p40),
						_1: A2(
							commonCase,
							close,
							{
								ctor: '::',
								_0: _p41,
								_1: {ctor: '::', _0: _p40, _1: _p39._1._1._1}
							})
					};
				}
			} else {
				return {ctor: '[]'};
			}
		});
	var _p42 = points;
	if ((_p42.ctor === '::') && (_p42._1.ctor === '::')) {
		if (_p42._1._1.ctor === '::') {
			var _p46 = _p42._1._1._0;
			var _p45 = _p42._1._0;
			var _p44 = _p42._0;
			var closing = F2(
				function (p0, p1) {
					return {
						ctor: '::',
						_0: A3(_folkertdev$one_true_path_experiment$Curve$basisPoint, p0, p1, _p44),
						_1: {
							ctor: '::',
							_0: A3(_folkertdev$one_true_path_experiment$Curve$basisPoint, p1, _p44, _p45),
							_1: {
								ctor: '::',
								_0: A3(_folkertdev$one_true_path_experiment$Curve$basisPoint, _p44, _p45, _p46),
								_1: {ctor: '[]'}
							}
						}
					};
				});
			var _p43 = {ctor: '_Tuple3', _0: _p44, _1: _p45, _2: _p46};
			var p0 = _p43._0;
			var p1 = _p43._1;
			var p = _p43._2;
			var start = A2(
				_Zinggi$elm_webgl_math$Vector2$divideBy,
				6,
				A2(
					_Zinggi$elm_webgl_math$Vector2$add,
					p,
					A2(
						_Zinggi$elm_webgl_math$Vector2$add,
						A2(_Zinggi$elm_webgl_math$Vector2$scale, 4, p1),
						p0)));
			return A2(
				_folkertdev$one_true_path_experiment$SubPath$subpath,
				_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(start),
				{
					ctor: '::',
					_0: _folkertdev$one_true_path_experiment$LowLevel_Command$cubicCurveTo(
						A2(
							commonCase,
							closing,
							{
								ctor: '::',
								_0: _p45,
								_1: {ctor: '::', _0: _p46, _1: _p42._1._1._1}
							})),
					_1: {ctor: '[]'}
				});
		} else {
			return A2(
				_folkertdev$one_true_path_experiment$SubPath$subpath,
				_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p42._0),
				{
					ctor: '::',
					_0: _folkertdev$one_true_path_experiment$LowLevel_Command$lineTo(
						{
							ctor: '::',
							_0: _p42._1._0,
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				});
		}
	} else {
		return _folkertdev$one_true_path_experiment$SubPath$empty;
	}
};
var _folkertdev$one_true_path_experiment$Curve$basisOpen = function (points) {
	var helper = function (points) {
		var _p47 = points;
		if (((_p47.ctor === '::') && (_p47._1.ctor === '::')) && (_p47._1._1.ctor === '::')) {
			var _p49 = _p47._1._0;
			var _p48 = _p47._1._1._0;
			return {
				ctor: '::',
				_0: A3(_folkertdev$one_true_path_experiment$Curve$basisPoint, _p47._0, _p49, _p48),
				_1: helper(
					{
						ctor: '::',
						_0: _p49,
						_1: {ctor: '::', _0: _p48, _1: _p47._1._1._1}
					})
			};
		} else {
			return {ctor: '[]'};
		}
	};
	var _p50 = points;
	if (((_p50.ctor === '::') && (_p50._1.ctor === '::')) && (_p50._1._1.ctor === '::')) {
		var _p52 = _p50._1._0;
		var _p51 = _p50._1._1._0;
		var start = A2(
			_Zinggi$elm_webgl_math$Vector2$divideBy,
			6,
			A2(
				_Zinggi$elm_webgl_math$Vector2$add,
				_p51,
				A2(
					_Zinggi$elm_webgl_math$Vector2$add,
					A2(_Zinggi$elm_webgl_math$Vector2$scale, 4, _p52),
					_p50._0)));
		return A2(
			_folkertdev$one_true_path_experiment$SubPath$subpath,
			_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(start),
			{
				ctor: '::',
				_0: _folkertdev$one_true_path_experiment$LowLevel_Command$cubicCurveTo(
					helper(
						{
							ctor: '::',
							_0: _p52,
							_1: {ctor: '::', _0: _p51, _1: _p50._1._1._1}
						})),
				_1: {ctor: '[]'}
			});
	} else {
		return _folkertdev$one_true_path_experiment$SubPath$empty;
	}
};
var _folkertdev$one_true_path_experiment$Curve$toPolarWithCenter = function (_p53) {
	var _p54 = _p53;
	return _elm_lang$core$List$map(
		function (_p55) {
			var _p56 = _p55;
			var _p58 = _p56._1;
			var _p57 = _p56._0;
			return {
				ctor: '_Tuple2',
				_0: (_p58 * _elm_lang$core$Basics$sin(_p57)) + _p54._0,
				_1: ((0 - _p58) * _elm_lang$core$Basics$cos(_p57)) + _p54._1
			};
		});
};
var _folkertdev$one_true_path_experiment$Curve$linearClosed = function (points) {
	var _p59 = points;
	if (_p59.ctor === '[]') {
		return _folkertdev$one_true_path_experiment$SubPath$empty;
	} else {
		return A2(
			_folkertdev$one_true_path_experiment$SubPath$subpath,
			_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p59._0),
			{
				ctor: '::',
				_0: _folkertdev$one_true_path_experiment$LowLevel_Command$lineTo(_p59._1),
				_1: {
					ctor: '::',
					_0: _folkertdev$one_true_path_experiment$LowLevel_Command$closePath,
					_1: {ctor: '[]'}
				}
			});
	}
};
var _folkertdev$one_true_path_experiment$Curve$smoothQuadraticBezier = F3(
	function (start, first, points) {
		var lowLevelDrawTos = {
			ctor: '::',
			_0: A2(
				_folkertdev$svg_path_lowlevel$Path_LowLevel$QuadraticBezierCurveTo,
				_folkertdev$svg_path_lowlevel$Path_LowLevel$Absolute,
				{
					ctor: '::',
					_0: first,
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(_folkertdev$svg_path_lowlevel$Path_LowLevel$SmoothQuadraticBezierCurveTo, _folkertdev$svg_path_lowlevel$Path_LowLevel$Absolute, points),
				_1: {ctor: '[]'}
			}
		};
		var lowLevelSubPath = {
			moveto: A2(_folkertdev$svg_path_lowlevel$Path_LowLevel$MoveTo, _folkertdev$svg_path_lowlevel$Path_LowLevel$Absolute, start),
			drawtos: lowLevelDrawTos
		};
		return _folkertdev$one_true_path_experiment$SubPath$fromLowLevel(lowLevelSubPath);
	});
var _folkertdev$one_true_path_experiment$Curve$quadraticBezier = F2(
	function (start, points) {
		var _p60 = points;
		if (_p60.ctor === '[]') {
			return _folkertdev$one_true_path_experiment$SubPath$empty;
		} else {
			return A2(
				_folkertdev$one_true_path_experiment$SubPath$subpath,
				_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(start),
				{
					ctor: '::',
					_0: _folkertdev$one_true_path_experiment$LowLevel_Command$quadraticCurveTo(points),
					_1: {ctor: '[]'}
				});
		}
	});
var _folkertdev$one_true_path_experiment$Curve$smoothCubicBezier = F3(
	function (start, first, points) {
		var lowLevelDrawTos = {
			ctor: '::',
			_0: A2(
				_folkertdev$svg_path_lowlevel$Path_LowLevel$CurveTo,
				_folkertdev$svg_path_lowlevel$Path_LowLevel$Absolute,
				{
					ctor: '::',
					_0: first,
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(_folkertdev$svg_path_lowlevel$Path_LowLevel$SmoothCurveTo, _folkertdev$svg_path_lowlevel$Path_LowLevel$Absolute, points),
				_1: {ctor: '[]'}
			}
		};
		var lowLevelSubPath = {
			moveto: A2(_folkertdev$svg_path_lowlevel$Path_LowLevel$MoveTo, _folkertdev$svg_path_lowlevel$Path_LowLevel$Absolute, start),
			drawtos: lowLevelDrawTos
		};
		return _folkertdev$one_true_path_experiment$SubPath$fromLowLevel(lowLevelSubPath);
	});
var _folkertdev$one_true_path_experiment$Curve$cubicBezier = F2(
	function (start, points) {
		var _p61 = points;
		if (_p61.ctor === '[]') {
			return _folkertdev$one_true_path_experiment$SubPath$empty;
		} else {
			return A2(
				_folkertdev$one_true_path_experiment$SubPath$subpath,
				_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(start),
				{
					ctor: '::',
					_0: _folkertdev$one_true_path_experiment$LowLevel_Command$cubicCurveTo(points),
					_1: {ctor: '[]'}
				});
		}
	});
var _folkertdev$one_true_path_experiment$Curve$linear = function (points) {
	var _p62 = points;
	if (_p62.ctor === '[]') {
		return _folkertdev$one_true_path_experiment$SubPath$empty;
	} else {
		return A2(
			_folkertdev$one_true_path_experiment$SubPath$subpath,
			_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p62._0),
			{
				ctor: '::',
				_0: _folkertdev$one_true_path_experiment$LowLevel_Command$lineTo(_p62._1),
				_1: {ctor: '[]'}
			});
	}
};
var _folkertdev$one_true_path_experiment$Curve$radial = function (_p63) {
	var _p64 = _p63;
	return function (_p65) {
		return _folkertdev$one_true_path_experiment$Curve$linear(
			A2(
				_folkertdev$one_true_path_experiment$Curve$toPolarWithCenter,
				{ctor: '_Tuple2', _0: _p64._0, _1: _p64._1},
				_p65));
	};
};
var _folkertdev$one_true_path_experiment$Curve$step = F2(
	function (factor, points) {
		var helper = F2(
			function (_p67, _p66) {
				var _p68 = _p67;
				var _p72 = _p68._0;
				var _p69 = _p66;
				var _p71 = _p69._1;
				var _p70 = _p69._0;
				if (_elm_lang$core$Native_Utils.cmp(factor, 0) < 1) {
					return {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: _p72, _1: _p71},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: _p70, _1: _p71},
							_1: {ctor: '[]'}
						}
					};
				} else {
					var x1 = (_p72 * (1 - factor)) + (_p70 * factor);
					return {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: x1, _1: _p68._1},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: x1, _1: _p71},
							_1: {ctor: '[]'}
						}
					};
				}
			});
		var _p73 = points;
		if (_p73.ctor === '[]') {
			return _folkertdev$one_true_path_experiment$SubPath$empty;
		} else {
			var _p75 = _p73._1;
			var _p74 = _p73._0;
			return _folkertdev$one_true_path_experiment$Curve$linear(
				{
					ctor: '::',
					_0: _p74,
					_1: A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$List$concat(
							A3(_elm_lang$core$List$map2, helper, points, _p75)),
						{
							ctor: '::',
							_0: A2(
								_elm_lang$core$Maybe$withDefault,
								_p74,
								_elm_community$list_extra$List_Extra$last(_p75)),
							_1: {ctor: '[]'}
						})
				});
		}
	});
var _folkertdev$one_true_path_experiment$Curve$stepBefore = _folkertdev$one_true_path_experiment$Curve$step(0);
var _folkertdev$one_true_path_experiment$Curve$stepAfter = _folkertdev$one_true_path_experiment$Curve$step(1);
var _folkertdev$one_true_path_experiment$Curve$area = function (points) {
	var _p76 = _elm_lang$core$List$unzip(points);
	var low = _p76._0;
	var high = _p76._1;
	return _folkertdev$one_true_path_experiment$SubPath$close(
		A2(
			_folkertdev$one_true_path_experiment$SubPath$connect,
			A2(_folkertdev$one_true_path_experiment$Curve$step, 1.0, high),
			A2(_folkertdev$one_true_path_experiment$Curve$step, 1.0, low)));
};
var _folkertdev$one_true_path_experiment$Curve_ops = _folkertdev$one_true_path_experiment$Curve_ops || {};
_folkertdev$one_true_path_experiment$Curve_ops['=>'] = F2(
	function (v0, v1) {
		return {ctor: '_Tuple2', _0: v0, _1: v1};
	});
var _folkertdev$one_true_path_experiment$Curve$sign = function (x) {
	return (_elm_lang$core$Native_Utils.cmp(x, 0) < 0) ? -1 : 1;
};
var _folkertdev$one_true_path_experiment$Curve$slope3 = F3(
	function (_p79, _p78, _p77) {
		var _p80 = _p79;
		var _p81 = _p78;
		var _p86 = _p81;
		var _p82 = _p77;
		var _p83 = A2(_Zinggi$elm_webgl_math$Vector2$sub, _p82, _p86);
		var dx2 = _p83._0;
		var dy2 = _p83._1;
		var _p84 = A2(_Zinggi$elm_webgl_math$Vector2$sub, _p86, _p80);
		var dx1 = _p84._0;
		var dy1 = _p84._1;
		var _p85 = {
			ctor: '_Tuple2',
			_0: A2(_folkertdev$one_true_path_experiment$Curve$toH, dx1, dx2),
			_1: A2(_folkertdev$one_true_path_experiment$Curve$toH, dx2, dx1)
		};
		var s0h = _p85._0;
		var s1h = _p85._1;
		var s1 = dy2 / s1h;
		var s0 = dy1 / s0h;
		var p = ((s0 * dx2) + (s1 * dx1)) / (dx1 + dx2);
		return (_folkertdev$one_true_path_experiment$Curve$sign(s0) + _folkertdev$one_true_path_experiment$Curve$sign(s1)) * A2(
			_elm_lang$core$Basics$min,
			A2(
				_elm_lang$core$Basics$min,
				_elm_lang$core$Basics$abs(s0),
				_elm_lang$core$Basics$abs(s1)),
			0.5 * _elm_lang$core$Basics$abs(p));
	});
var _folkertdev$one_true_path_experiment$Curve$monotoneX = function (points) {
	var _p87 = points;
	if ((_p87.ctor === '::') && (_p87._1.ctor === '::')) {
		if (_p87._1._1.ctor === '::') {
			var _p96 = _p87._1._0;
			var _p95 = _p87._0;
			var _p94 = _p87._1._1._0;
			var helper = F2(
				function (t0, points) {
					var _p88 = points;
					if ((_p88.ctor === '::') && (_p88._1.ctor === '::')) {
						if (_p88._1._1.ctor === '::') {
							var _p91 = _p88._1._0;
							var _p90 = _p88._0;
							var _p89 = _p88._1._1._0;
							var t1 = A3(_folkertdev$one_true_path_experiment$Curve$slope3, _p90, _p91, _p89);
							return {
								ctor: '::',
								_0: A4(_folkertdev$one_true_path_experiment$Curve$monotonePoint, _p90, _p91, t0, t1),
								_1: A2(
									helper,
									t1,
									{
										ctor: '::',
										_0: _p91,
										_1: {ctor: '::', _0: _p89, _1: _p88._1._1._1}
									})
							};
						} else {
							var _p93 = _p88._1._0;
							var _p92 = _p88._0;
							return {
								ctor: '::',
								_0: A4(
									_folkertdev$one_true_path_experiment$Curve$monotonePoint,
									_p92,
									_p93,
									t0,
									A3(_folkertdev$one_true_path_experiment$Curve$slope2, _p92, _p93, t0)),
								_1: {ctor: '[]'}
							};
						}
					} else {
						return {ctor: '[]'};
					}
				});
			var t1 = A3(_folkertdev$one_true_path_experiment$Curve$slope3, _p95, _p96, _p94);
			var initialInstruction = A4(
				_folkertdev$one_true_path_experiment$Curve$monotonePoint,
				_p95,
				_p96,
				A3(_folkertdev$one_true_path_experiment$Curve$slope2, _p95, _p96, t1),
				t1);
			return A2(
				_folkertdev$one_true_path_experiment$SubPath$subpath,
				_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p95),
				{
					ctor: '::',
					_0: _folkertdev$one_true_path_experiment$LowLevel_Command$cubicCurveTo(
						{
							ctor: '::',
							_0: initialInstruction,
							_1: A2(
								helper,
								t1,
								{
									ctor: '::',
									_0: _p96,
									_1: {ctor: '::', _0: _p94, _1: _p87._1._1._1}
								})
						}),
					_1: {ctor: '[]'}
				});
		} else {
			return A2(
				_folkertdev$one_true_path_experiment$SubPath$subpath,
				_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p87._0),
				{
					ctor: '::',
					_0: _folkertdev$one_true_path_experiment$LowLevel_Command$lineTo(
						{
							ctor: '::',
							_0: _p87._1._0,
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				});
		}
	} else {
		return _folkertdev$one_true_path_experiment$SubPath$empty;
	}
};
var _folkertdev$one_true_path_experiment$Curve$monotoneY = function (points) {
	return A2(
		_folkertdev$one_true_path_experiment$SubPath$mapCoordinate,
		function (_p97) {
			var _p98 = _p97;
			return {ctor: '_Tuple2', _0: _p98._1, _1: _p98._0};
		},
		_folkertdev$one_true_path_experiment$Curve$monotoneX(
			A2(
				_elm_lang$core$List$map,
				function (_p99) {
					var _p100 = _p99;
					return {ctor: '_Tuple2', _0: _p100._1, _1: _p100._0};
				},
				points)));
};
var _folkertdev$one_true_path_experiment$Curve$epsilon = 1.0e-12;
var _folkertdev$one_true_path_experiment$Curve$catmullRomPoint = F5(
	function (alpha, p0, p1, p2, p3) {
		var _p101 = A3(_folkertdev$one_true_path_experiment$Curve$catmullRomDistance, alpha, p2, p3);
		var l23_a = _p101._0;
		var l23_2a = _p101._1;
		var _p102 = A3(_folkertdev$one_true_path_experiment$Curve$catmullRomDistance, alpha, p1, p2);
		var l12_a = _p102._0;
		var l12_2a = _p102._1;
		var helper2 = function (p) {
			var m = (3 * l23_a) * (l23_a + l12_a);
			var b = ((2 * l23_2a) + ((3 * l23_a) * l12_a)) + l12_2a;
			return A2(
				_Zinggi$elm_webgl_math$Vector2$divideBy,
				m,
				A2(
					_Zinggi$elm_webgl_math$Vector2$add,
					A2(_Zinggi$elm_webgl_math$Vector2$scale, 0 - l12_2a, p3),
					A2(
						_Zinggi$elm_webgl_math$Vector2$add,
						A2(_Zinggi$elm_webgl_math$Vector2$scale, l23_2a, p1),
						A2(_Zinggi$elm_webgl_math$Vector2$scale, b, p))));
		};
		var control2 = (_elm_lang$core$Native_Utils.cmp(l23_a, _folkertdev$one_true_path_experiment$Curve$epsilon) > 0) ? helper2(p2) : p2;
		var _p103 = A3(_folkertdev$one_true_path_experiment$Curve$catmullRomDistance, alpha, p0, p1);
		var l01_a = _p103._0;
		var l01_2a = _p103._1;
		var helper1 = function (p) {
			var n = (3 * l01_a) * (l01_a + l12_a);
			var a = ((2 * l01_2a) + ((3 * l01_a) * l12_a)) + l12_2a;
			return A2(
				_Zinggi$elm_webgl_math$Vector2$divideBy,
				n,
				A2(
					_Zinggi$elm_webgl_math$Vector2$add,
					A2(_Zinggi$elm_webgl_math$Vector2$scale, l01_2a, p2),
					A2(
						_Zinggi$elm_webgl_math$Vector2$sub,
						A2(_Zinggi$elm_webgl_math$Vector2$scale, a, p),
						A2(_Zinggi$elm_webgl_math$Vector2$scale, l12_2a, p0))));
		};
		var control1 = (_elm_lang$core$Native_Utils.cmp(l01_a, _folkertdev$one_true_path_experiment$Curve$epsilon) > 0) ? helper1(p1) : p1;
		return {ctor: '_Tuple3', _0: control1, _1: control2, _2: p2};
	});
var _folkertdev$one_true_path_experiment$Curve$catmullRomHelper = F3(
	function (alpha, ending, points) {
		var _p104 = points;
		if (((_p104.ctor === '::') && (_p104._1.ctor === '::')) && (_p104._1._1.ctor === '::')) {
			if (_p104._1._1._1.ctor === '[]') {
				return A3(ending, _p104._0, _p104._1._0, _p104._1._1._0);
			} else {
				var _p107 = _p104._1._1._0;
				var _p106 = _p104._1._0;
				var _p105 = _p104._1._1._1._0;
				return {
					ctor: '::',
					_0: A5(_folkertdev$one_true_path_experiment$Curve$catmullRomPoint, alpha, _p104._0, _p106, _p107, _p105),
					_1: A3(
						_folkertdev$one_true_path_experiment$Curve$catmullRomHelper,
						alpha,
						ending,
						{
							ctor: '::',
							_0: _p106,
							_1: {
								ctor: '::',
								_0: _p107,
								_1: {ctor: '::', _0: _p105, _1: _p104._1._1._1._1}
							}
						})
				};
			}
		} else {
			return {ctor: '[]'};
		}
	});
var _folkertdev$one_true_path_experiment$Curve$catmullRom = F2(
	function (alpha, points) {
		if (_elm_lang$core$Native_Utils.eq(alpha, 0)) {
			return A2(_folkertdev$one_true_path_experiment$Curve$cardinal, 0, points);
		} else {
			var _p108 = points;
			_v35_2:
			do {
				if ((_p108.ctor === '::') && (_p108._1.ctor === '::')) {
					if (_p108._1._1.ctor === '[]') {
						return A2(
							_folkertdev$one_true_path_experiment$SubPath$subpath,
							_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p108._0),
							{
								ctor: '::',
								_0: _folkertdev$one_true_path_experiment$LowLevel_Command$lineTo(
									{
										ctor: '::',
										_0: _p108._1._0,
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							});
					} else {
						if (_p108._1._1._1.ctor === '::') {
							var _p109 = _p108._0;
							var ending = F3(
								function (p0, p1, p2) {
									return {
										ctor: '::',
										_0: A5(_folkertdev$one_true_path_experiment$Curve$catmullRomPoint, alpha, p0, p1, p2, p2),
										_1: {ctor: '[]'}
									};
								});
							return A2(
								_folkertdev$one_true_path_experiment$SubPath$subpath,
								_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p109),
								{
									ctor: '::',
									_0: _folkertdev$one_true_path_experiment$LowLevel_Command$cubicCurveTo(
										A3(
											_folkertdev$one_true_path_experiment$Curve$catmullRomHelper,
											alpha,
											ending,
											{ctor: '::', _0: _p109, _1: points})),
									_1: {ctor: '[]'}
								});
						} else {
							break _v35_2;
						}
					}
				} else {
					break _v35_2;
				}
			} while(false);
			return _folkertdev$one_true_path_experiment$SubPath$empty;
		}
	});
var _folkertdev$one_true_path_experiment$Curve$catmullRomOpen = F2(
	function (alpha, points) {
		if (_elm_lang$core$Native_Utils.eq(alpha, 0)) {
			return A2(_folkertdev$one_true_path_experiment$Curve$cardinalOpen, 0, points);
		} else {
			var _p110 = points;
			if (((_p110.ctor === '::') && (_p110._1.ctor === '::')) && (_p110._1._1.ctor === '::')) {
				if (_p110._1._1._1.ctor === '[]') {
					return A2(
						_folkertdev$one_true_path_experiment$SubPath$subpath,
						_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p110._1._1._0),
						{ctor: '[]'});
				} else {
					var ending = F3(
						function (_p113, _p112, _p111) {
							return {ctor: '[]'};
						});
					return A2(
						_folkertdev$one_true_path_experiment$SubPath$subpath,
						_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p110._1._0),
						{
							ctor: '::',
							_0: _folkertdev$one_true_path_experiment$LowLevel_Command$cubicCurveTo(
								A3(_folkertdev$one_true_path_experiment$Curve$catmullRomHelper, alpha, ending, points)),
							_1: {ctor: '[]'}
						});
				}
			} else {
				return _folkertdev$one_true_path_experiment$SubPath$empty;
			}
		}
	});
var _folkertdev$one_true_path_experiment$Curve$catmullRomClosed = F2(
	function (alpha, points) {
		if (_elm_lang$core$Native_Utils.eq(alpha, 0)) {
			return A2(_folkertdev$one_true_path_experiment$Curve$cardinalClosed, 0, points);
		} else {
			var _p114 = points;
			if (_p114.ctor === '[]') {
				return _folkertdev$one_true_path_experiment$SubPath$empty;
			} else {
				if (_p114._1.ctor === '[]') {
					return A2(
						_folkertdev$one_true_path_experiment$SubPath$subpath,
						_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p114._0),
						{ctor: '[]'});
				} else {
					if (_p114._1._1.ctor === '[]') {
						return A2(
							_folkertdev$one_true_path_experiment$SubPath$subpath,
							_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p114._1._0),
							{
								ctor: '::',
								_0: _folkertdev$one_true_path_experiment$LowLevel_Command$lineTo(
									{
										ctor: '::',
										_0: _p114._0,
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: _folkertdev$one_true_path_experiment$LowLevel_Command$closePath,
									_1: {ctor: '[]'}
								}
							});
					} else {
						var _p116 = _p114._1._0;
						var _p115 = _p114._0;
						var ending = F3(
							function (p0, p1, p2) {
								return {
									ctor: '::',
									_0: A5(_folkertdev$one_true_path_experiment$Curve$catmullRomPoint, alpha, p0, p1, p2, _p115),
									_1: {
										ctor: '::',
										_0: A5(_folkertdev$one_true_path_experiment$Curve$catmullRomPoint, alpha, p1, p2, _p115, _p116),
										_1: {
											ctor: '::',
											_0: A5(_folkertdev$one_true_path_experiment$Curve$catmullRomPoint, alpha, p2, _p115, _p116, _p114._1._1._0),
											_1: {ctor: '[]'}
										}
									}
								};
							});
						return A2(
							_folkertdev$one_true_path_experiment$SubPath$subpath,
							_folkertdev$one_true_path_experiment$LowLevel_Command$moveTo(_p116),
							{
								ctor: '::',
								_0: _folkertdev$one_true_path_experiment$LowLevel_Command$cubicCurveTo(
									A3(_folkertdev$one_true_path_experiment$Curve$catmullRomHelper, alpha, ending, points)),
								_1: {ctor: '[]'}
							});
					}
				}
			}
		}
	});

var _mgold$elm_date_format$Date_Local$french = {
	date: {
		months: {jan: 'Janvier', feb: 'Février', mar: 'Mars', apr: 'Avril', may: 'Mai', jun: 'Juin', jul: 'Juillet', aug: 'Août', sep: 'Septembre', oct: 'Octobre', nov: 'Novembre', dec: 'Décembre'},
		monthsAbbrev: {jan: 'Jan', feb: 'Fév', mar: 'Mar', apr: 'Avr', may: 'Mai', jun: 'Jui', jul: 'Jul', aug: 'Aoû', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Déc'},
		wdays: {mon: 'Lundi', tue: 'Mardi', wed: 'Mercredi', thu: 'Jeudi', fri: 'Vendredi', sat: 'Samedi', sun: 'Dimanche'},
		wdaysAbbrev: {mon: 'Lun', tue: 'Mar', wed: 'Mer', thu: 'Jeu', fri: 'Ven', sat: 'Sam', sun: 'Dim'},
		defaultFormat: _elm_lang$core$Maybe$Nothing
	},
	time: {am: 'am', pm: 'pm', defaultFormat: _elm_lang$core$Maybe$Nothing},
	timeZones: _elm_lang$core$Maybe$Nothing,
	defaultFormat: _elm_lang$core$Maybe$Nothing
};
var _mgold$elm_date_format$Date_Local$international = {
	date: {
		months: {jan: 'January', feb: 'February', mar: 'March', apr: 'April', may: 'May', jun: 'June', jul: 'July', aug: 'August', sep: 'September', oct: 'October', nov: 'November', dec: 'December'},
		monthsAbbrev: {jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun', jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec'},
		wdays: {mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday'},
		wdaysAbbrev: {mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun'},
		defaultFormat: _elm_lang$core$Maybe$Nothing
	},
	time: {am: 'am', pm: 'pm', defaultFormat: _elm_lang$core$Maybe$Nothing},
	timeZones: _elm_lang$core$Maybe$Nothing,
	defaultFormat: _elm_lang$core$Maybe$Nothing
};
var _mgold$elm_date_format$Date_Local$Local = F4(
	function (a, b, c, d) {
		return {date: a, time: b, timeZones: c, defaultFormat: d};
	});
var _mgold$elm_date_format$Date_Local$Months = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return {jan: a, feb: b, mar: c, apr: d, may: e, jun: f, jul: g, aug: h, sep: i, oct: j, nov: k, dec: l};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _mgold$elm_date_format$Date_Local$WeekDays = F7(
	function (a, b, c, d, e, f, g) {
		return {mon: a, tue: b, wed: c, thu: d, fri: e, sat: f, sun: g};
	});

var _mgold$elm_date_format$Date_Format$padWith = function (padding) {
	var padder = function () {
		var _p0 = padding;
		switch (_p0.ctor) {
			case 'NoPadding':
				return _elm_lang$core$Basics$identity;
			case 'Zero':
				return A2(
					_elm_lang$core$String$padLeft,
					2,
					_elm_lang$core$Native_Utils.chr('0'));
			case 'ZeroThreeDigits':
				return A2(
					_elm_lang$core$String$padLeft,
					3,
					_elm_lang$core$Native_Utils.chr('0'));
			default:
				return A2(
					_elm_lang$core$String$padLeft,
					2,
					_elm_lang$core$Native_Utils.chr(' '));
		}
	}();
	return function (_p1) {
		return padder(
			_elm_lang$core$Basics$toString(_p1));
	};
};
var _mgold$elm_date_format$Date_Format$zero2twelve = function (n) {
	return _elm_lang$core$Native_Utils.eq(n, 0) ? 12 : n;
};
var _mgold$elm_date_format$Date_Format$mod12 = function (h) {
	return A2(_elm_lang$core$Basics_ops['%'], h, 12);
};
var _mgold$elm_date_format$Date_Format$dayOfWeekToWord = F2(
	function (loc, dow) {
		var _p2 = dow;
		switch (_p2.ctor) {
			case 'Mon':
				return loc.mon;
			case 'Tue':
				return loc.tue;
			case 'Wed':
				return loc.wed;
			case 'Thu':
				return loc.thu;
			case 'Fri':
				return loc.fri;
			case 'Sat':
				return loc.sat;
			default:
				return loc.sun;
		}
	});
var _mgold$elm_date_format$Date_Format$monthToWord = F2(
	function (loc, m) {
		var _p3 = m;
		switch (_p3.ctor) {
			case 'Jan':
				return loc.jan;
			case 'Feb':
				return loc.feb;
			case 'Mar':
				return loc.mar;
			case 'Apr':
				return loc.apr;
			case 'May':
				return loc.may;
			case 'Jun':
				return loc.jun;
			case 'Jul':
				return loc.jul;
			case 'Aug':
				return loc.aug;
			case 'Sep':
				return loc.sep;
			case 'Oct':
				return loc.oct;
			case 'Nov':
				return loc.nov;
			default:
				return loc.dec;
		}
	});
var _mgold$elm_date_format$Date_Format$monthToInt = function (m) {
	var _p4 = m;
	switch (_p4.ctor) {
		case 'Jan':
			return 1;
		case 'Feb':
			return 2;
		case 'Mar':
			return 3;
		case 'Apr':
			return 4;
		case 'May':
			return 5;
		case 'Jun':
			return 6;
		case 'Jul':
			return 7;
		case 'Aug':
			return 8;
		case 'Sep':
			return 9;
		case 'Oct':
			return 10;
		case 'Nov':
			return 11;
		default:
			return 12;
	}
};
var _mgold$elm_date_format$Date_Format$re = _elm_lang$core$Regex$regex('%(_|-|0)?(%|Y|y|m|B|b|d|e|a|A|H|k|I|l|L|p|P|M|S)');
var _mgold$elm_date_format$Date_Format$ZeroThreeDigits = {ctor: 'ZeroThreeDigits'};
var _mgold$elm_date_format$Date_Format$Zero = {ctor: 'Zero'};
var _mgold$elm_date_format$Date_Format$Space = {ctor: 'Space'};
var _mgold$elm_date_format$Date_Format$NoPadding = {ctor: 'NoPadding'};
var _mgold$elm_date_format$Date_Format$formatToken = F3(
	function (loc, d, m) {
		var _p5 = function () {
			var _p6 = m.submatches;
			_v4_4:
			do {
				if (_p6.ctor === '::') {
					if (_p6._0.ctor === 'Just') {
						if (((_p6._1.ctor === '::') && (_p6._1._0.ctor === 'Just')) && (_p6._1._1.ctor === '[]')) {
							switch (_p6._0._0) {
								case '-':
									return {
										ctor: '_Tuple2',
										_0: _elm_lang$core$Maybe$Just(_mgold$elm_date_format$Date_Format$NoPadding),
										_1: _p6._1._0._0
									};
								case '_':
									return {
										ctor: '_Tuple2',
										_0: _elm_lang$core$Maybe$Just(_mgold$elm_date_format$Date_Format$Space),
										_1: _p6._1._0._0
									};
								case '0':
									return {
										ctor: '_Tuple2',
										_0: _elm_lang$core$Maybe$Just(_mgold$elm_date_format$Date_Format$Zero),
										_1: _p6._1._0._0
									};
								default:
									break _v4_4;
							}
						} else {
							break _v4_4;
						}
					} else {
						if (((_p6._1.ctor === '::') && (_p6._1._0.ctor === 'Just')) && (_p6._1._1.ctor === '[]')) {
							return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _p6._1._0._0};
						} else {
							break _v4_4;
						}
					}
				} else {
					break _v4_4;
				}
			} while(false);
			return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: ' '};
		}();
		var padding = _p5._0;
		var symbol = _p5._1;
		var _p7 = symbol;
		switch (_p7) {
			case '%':
				return '%';
			case 'Y':
				return _elm_lang$core$Basics$toString(
					_elm_lang$core$Date$year(d));
			case 'y':
				return A2(
					_elm_lang$core$String$right,
					2,
					_elm_lang$core$Basics$toString(
						_elm_lang$core$Date$year(d)));
			case 'm':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$Zero, padding),
					_mgold$elm_date_format$Date_Format$monthToInt(
						_elm_lang$core$Date$month(d)));
			case 'B':
				return A2(
					_mgold$elm_date_format$Date_Format$monthToWord,
					loc.date.months,
					_elm_lang$core$Date$month(d));
			case 'b':
				return A2(
					_mgold$elm_date_format$Date_Format$monthToWord,
					loc.date.monthsAbbrev,
					_elm_lang$core$Date$month(d));
			case 'd':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$Zero, padding),
					_elm_lang$core$Date$day(d));
			case 'e':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$Space, padding),
					_elm_lang$core$Date$day(d));
			case 'a':
				return A2(
					_mgold$elm_date_format$Date_Format$dayOfWeekToWord,
					loc.date.wdaysAbbrev,
					_elm_lang$core$Date$dayOfWeek(d));
			case 'A':
				return A2(
					_mgold$elm_date_format$Date_Format$dayOfWeekToWord,
					loc.date.wdays,
					_elm_lang$core$Date$dayOfWeek(d));
			case 'H':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$Zero, padding),
					_elm_lang$core$Date$hour(d));
			case 'k':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$Space, padding),
					_elm_lang$core$Date$hour(d));
			case 'I':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$Zero, padding),
					_mgold$elm_date_format$Date_Format$zero2twelve(
						_mgold$elm_date_format$Date_Format$mod12(
							_elm_lang$core$Date$hour(d))));
			case 'l':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$Space, padding),
					_mgold$elm_date_format$Date_Format$zero2twelve(
						_mgold$elm_date_format$Date_Format$mod12(
							_elm_lang$core$Date$hour(d))));
			case 'p':
				return (_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$Date$hour(d),
					12) < 0) ? _elm_lang$core$String$toUpper(loc.time.am) : _elm_lang$core$String$toUpper(loc.time.pm);
			case 'P':
				return (_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$Date$hour(d),
					12) < 0) ? loc.time.am : loc.time.pm;
			case 'M':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$Zero, padding),
					_elm_lang$core$Date$minute(d));
			case 'S':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$Zero, padding),
					_elm_lang$core$Date$second(d));
			case 'L':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$ZeroThreeDigits, padding),
					_elm_lang$core$Date$millisecond(d));
			default:
				return '';
		}
	});
var _mgold$elm_date_format$Date_Format$localFormat = F3(
	function (loc, s, d) {
		return A4(
			_elm_lang$core$Regex$replace,
			_elm_lang$core$Regex$All,
			_mgold$elm_date_format$Date_Format$re,
			A2(_mgold$elm_date_format$Date_Format$formatToken, loc, d),
			s);
	});
var _mgold$elm_date_format$Date_Format$format = F2(
	function (s, d) {
		return A3(_mgold$elm_date_format$Date_Format$localFormat, _mgold$elm_date_format$Date_Local$international, s, d);
	});
var _mgold$elm_date_format$Date_Format$formatISO8601 = _mgold$elm_date_format$Date_Format$format('%Y-%m-%dT%H:%M:%SZ');

var _mgold$elm_date_format$Time_Format$format = F2(
	function (s, t) {
		return A2(
			_mgold$elm_date_format$Date_Format$format,
			s,
			_elm_lang$core$Date$fromTime(t));
	});

var _rtfeldman$hex$Hex$toString = function (num) {
	return _elm_lang$core$String$fromList(
		(_elm_lang$core$Native_Utils.cmp(num, 0) < 0) ? {
			ctor: '::',
			_0: _elm_lang$core$Native_Utils.chr('-'),
			_1: A2(
				_rtfeldman$hex$Hex$unsafePositiveToDigits,
				{ctor: '[]'},
				_elm_lang$core$Basics$negate(num))
		} : A2(
			_rtfeldman$hex$Hex$unsafePositiveToDigits,
			{ctor: '[]'},
			num));
};
var _rtfeldman$hex$Hex$unsafePositiveToDigits = F2(
	function (digits, num) {
		unsafePositiveToDigits:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(num, 16) < 0) {
				return {
					ctor: '::',
					_0: _rtfeldman$hex$Hex$unsafeToDigit(num),
					_1: digits
				};
			} else {
				var _v0 = {
					ctor: '::',
					_0: _rtfeldman$hex$Hex$unsafeToDigit(
						A2(_elm_lang$core$Basics_ops['%'], num, 16)),
					_1: digits
				},
					_v1 = (num / 16) | 0;
				digits = _v0;
				num = _v1;
				continue unsafePositiveToDigits;
			}
		}
	});
var _rtfeldman$hex$Hex$unsafeToDigit = function (num) {
	var _p0 = num;
	switch (_p0) {
		case 0:
			return _elm_lang$core$Native_Utils.chr('0');
		case 1:
			return _elm_lang$core$Native_Utils.chr('1');
		case 2:
			return _elm_lang$core$Native_Utils.chr('2');
		case 3:
			return _elm_lang$core$Native_Utils.chr('3');
		case 4:
			return _elm_lang$core$Native_Utils.chr('4');
		case 5:
			return _elm_lang$core$Native_Utils.chr('5');
		case 6:
			return _elm_lang$core$Native_Utils.chr('6');
		case 7:
			return _elm_lang$core$Native_Utils.chr('7');
		case 8:
			return _elm_lang$core$Native_Utils.chr('8');
		case 9:
			return _elm_lang$core$Native_Utils.chr('9');
		case 10:
			return _elm_lang$core$Native_Utils.chr('a');
		case 11:
			return _elm_lang$core$Native_Utils.chr('b');
		case 12:
			return _elm_lang$core$Native_Utils.chr('c');
		case 13:
			return _elm_lang$core$Native_Utils.chr('d');
		case 14:
			return _elm_lang$core$Native_Utils.chr('e');
		case 15:
			return _elm_lang$core$Native_Utils.chr('f');
		default:
			return _elm_lang$core$Native_Utils.crashCase(
				'Hex',
				{
					start: {line: 138, column: 5},
					end: {line: 188, column: 84}
				},
				_p0)(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'Tried to convert ',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_rtfeldman$hex$Hex$toString(num),
						' to hexadecimal.')));
	}
};
var _rtfeldman$hex$Hex$fromStringHelp = F3(
	function (position, chars, accumulated) {
		var _p2 = chars;
		if (_p2.ctor === '[]') {
			return _elm_lang$core$Result$Ok(accumulated);
		} else {
			var recurse = function (additional) {
				return A3(
					_rtfeldman$hex$Hex$fromStringHelp,
					position - 1,
					_p2._1,
					accumulated + (additional * Math.pow(16, position)));
			};
			var _p3 = _p2._0;
			switch (_p3.valueOf()) {
				case '0':
					return recurse(0);
				case '1':
					return recurse(1);
				case '2':
					return recurse(2);
				case '3':
					return recurse(3);
				case '4':
					return recurse(4);
				case '5':
					return recurse(5);
				case '6':
					return recurse(6);
				case '7':
					return recurse(7);
				case '8':
					return recurse(8);
				case '9':
					return recurse(9);
				case 'a':
					return recurse(10);
				case 'b':
					return recurse(11);
				case 'c':
					return recurse(12);
				case 'd':
					return recurse(13);
				case 'e':
					return recurse(14);
				case 'f':
					return recurse(15);
				default:
					return _elm_lang$core$Result$Err(
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(_p3),
							' is not a valid hexadecimal character.'));
			}
		}
	});
var _rtfeldman$hex$Hex$fromString = function (str) {
	if (_elm_lang$core$String$isEmpty(str)) {
		return _elm_lang$core$Result$Err('Empty strings are not valid hexadecimal strings.');
	} else {
		var formatError = function (err) {
			return A2(
				_elm_lang$core$String$join,
				' ',
				{
					ctor: '::',
					_0: _elm_lang$core$Basics$toString(str),
					_1: {
						ctor: '::',
						_0: 'is not a valid hexadecimal string because',
						_1: {
							ctor: '::',
							_0: err,
							_1: {ctor: '[]'}
						}
					}
				});
		};
		var result = function () {
			if (A2(_elm_lang$core$String$startsWith, '-', str)) {
				var list = A2(
					_elm_lang$core$Maybe$withDefault,
					{ctor: '[]'},
					_elm_lang$core$List$tail(
						_elm_lang$core$String$toList(str)));
				return A2(
					_elm_lang$core$Result$map,
					_elm_lang$core$Basics$negate,
					A3(
						_rtfeldman$hex$Hex$fromStringHelp,
						_elm_lang$core$List$length(list) - 1,
						list,
						0));
			} else {
				return A3(
					_rtfeldman$hex$Hex$fromStringHelp,
					_elm_lang$core$String$length(str) - 1,
					_elm_lang$core$String$toList(str),
					0);
			}
		}();
		return A2(_elm_lang$core$Result$mapError, formatError, result);
	}
};

var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$horizontalAlignOption = function (align) {
	var _p0 = align;
	switch (_p0.ctor) {
		case 'Left':
			return 'start';
		case 'Center':
			return 'center';
		case 'Right':
			return 'end';
		case 'Around':
			return 'around';
		default:
			return 'between';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$verticalAlignOption = function (align) {
	var _p1 = align;
	switch (_p1.ctor) {
		case 'Top':
			return 'start';
		case 'Middle':
			return 'center';
		default:
			return 'end';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$moveCountOption = function (size) {
	var _p2 = size;
	switch (_p2.ctor) {
		case 'Move0':
			return '0';
		case 'Move1':
			return '1';
		case 'Move2':
			return '2';
		case 'Move3':
			return '3';
		case 'Move4':
			return '4';
		case 'Move5':
			return '5';
		case 'Move6':
			return '6';
		case 'Move7':
			return '7';
		case 'Move8':
			return '8';
		case 'Move9':
			return '9';
		case 'Move10':
			return '10';
		case 'Move11':
			return '11';
		default:
			return '12';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$offsetCountOption = function (size) {
	var _p3 = size;
	switch (_p3.ctor) {
		case 'Offset0':
			return '0';
		case 'Offset1':
			return '1';
		case 'Offset2':
			return '2';
		case 'Offset3':
			return '3';
		case 'Offset4':
			return '4';
		case 'Offset5':
			return '5';
		case 'Offset6':
			return '6';
		case 'Offset7':
			return '7';
		case 'Offset8':
			return '8';
		case 'Offset9':
			return '9';
		case 'Offset10':
			return '10';
		default:
			return '11';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$columnCountOption = function (size) {
	var _p4 = size;
	switch (_p4.ctor) {
		case 'Col':
			return _elm_lang$core$Maybe$Nothing;
		case 'Col1':
			return _elm_lang$core$Maybe$Just('1');
		case 'Col2':
			return _elm_lang$core$Maybe$Just('2');
		case 'Col3':
			return _elm_lang$core$Maybe$Just('3');
		case 'Col4':
			return _elm_lang$core$Maybe$Just('4');
		case 'Col5':
			return _elm_lang$core$Maybe$Just('5');
		case 'Col6':
			return _elm_lang$core$Maybe$Just('6');
		case 'Col7':
			return _elm_lang$core$Maybe$Just('7');
		case 'Col8':
			return _elm_lang$core$Maybe$Just('8');
		case 'Col9':
			return _elm_lang$core$Maybe$Just('9');
		case 'Col10':
			return _elm_lang$core$Maybe$Just('10');
		case 'Col11':
			return _elm_lang$core$Maybe$Just('11');
		case 'Col12':
			return _elm_lang$core$Maybe$Just('12');
		default:
			return _elm_lang$core$Maybe$Just('auto');
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeOption = function (size) {
	var _p5 = size;
	switch (_p5.ctor) {
		case 'XS':
			return _elm_lang$core$Maybe$Nothing;
		case 'SM':
			return _elm_lang$core$Maybe$Just('sm');
		case 'MD':
			return _elm_lang$core$Maybe$Just('md');
		case 'LG':
			return _elm_lang$core$Maybe$Just('lg');
		default:
			return _elm_lang$core$Maybe$Just('xl');
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeToPartialString = function (screenSize) {
	var _p6 = _rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeOption(screenSize);
	if (_p6.ctor === 'Just') {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			'-',
			A2(_elm_lang$core$Basics_ops['++'], _p6._0, '-'));
	} else {
		return '-';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$hAlignClass = function (_p7) {
	var _p8 = _p7;
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'justify-content-',
			A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$Maybe$withDefault,
					'',
					A2(
						_elm_lang$core$Maybe$map,
						function (v) {
							return A2(_elm_lang$core$Basics_ops['++'], v, '-');
						},
						_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeOption(_p8.screenSize))),
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$horizontalAlignOption(_p8.align))));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$hAlignsToAttributes = function (aligns) {
	var align = function (a) {
		return A2(_elm_lang$core$Maybe$map, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$hAlignClass, a);
	};
	return A2(
		_elm_lang$core$List$filterMap,
		_elm_lang$core$Basics$identity,
		A2(_elm_lang$core$List$map, align, aligns));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$vAlignClass = F2(
	function (prefix, _p9) {
		var _p10 = _p9;
		return _elm_lang$html$Html_Attributes$class(
			A2(
				_elm_lang$core$Basics_ops['++'],
				prefix,
				A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_elm_lang$core$Maybe$withDefault,
						'',
						A2(
							_elm_lang$core$Maybe$map,
							function (v) {
								return A2(_elm_lang$core$Basics_ops['++'], v, '-');
							},
							_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeOption(_p10.screenSize))),
					_rundis$elm_bootstrap$Bootstrap_Grid_Internal$verticalAlignOption(_p10.align))));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$vAlignsToAttributes = F2(
	function (prefix, aligns) {
		var align = function (a) {
			return A2(
				_elm_lang$core$Maybe$map,
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$vAlignClass(prefix),
				a);
		};
		return A2(
			_elm_lang$core$List$filterMap,
			_elm_lang$core$Basics$identity,
			A2(_elm_lang$core$List$map, align, aligns));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$pushesToAttributes = function (pushes) {
	var push = function (m) {
		var _p11 = m;
		if (_p11.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				_elm_lang$html$Html_Attributes$class(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'push',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeToPartialString(_p11._0.screenSize),
							_rundis$elm_bootstrap$Bootstrap_Grid_Internal$moveCountOption(_p11._0.moveCount)))));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	};
	return A2(
		_elm_lang$core$List$filterMap,
		_elm_lang$core$Basics$identity,
		A2(_elm_lang$core$List$map, push, pushes));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$pullsToAttributes = function (pulls) {
	var pull = function (m) {
		var _p12 = m;
		if (_p12.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				_elm_lang$html$Html_Attributes$class(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'pull',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeToPartialString(_p12._0.screenSize),
							_rundis$elm_bootstrap$Bootstrap_Grid_Internal$moveCountOption(_p12._0.moveCount)))));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	};
	return A2(
		_elm_lang$core$List$filterMap,
		_elm_lang$core$Basics$identity,
		A2(_elm_lang$core$List$map, pull, pulls));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$offsetClass = function (_p13) {
	var _p14 = _p13;
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'offset',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeToPartialString(_p14.screenSize),
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offsetCountOption(_p14.offsetCount))));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$offsetsToAttributes = function (offsets) {
	var offset = function (m) {
		return A2(_elm_lang$core$Maybe$map, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$offsetClass, m);
	};
	return A2(
		_elm_lang$core$List$filterMap,
		_elm_lang$core$Basics$identity,
		A2(_elm_lang$core$List$map, offset, offsets));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$colWidthClass = function (_p15) {
	var _p16 = _p15;
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'col',
			A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$Maybe$withDefault,
					'',
					A2(
						_elm_lang$core$Maybe$map,
						function (v) {
							return A2(_elm_lang$core$Basics_ops['++'], '-', v);
						},
						_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeOption(_p16.screenSize))),
				A2(
					_elm_lang$core$Maybe$withDefault,
					'',
					A2(
						_elm_lang$core$Maybe$map,
						function (v) {
							return A2(_elm_lang$core$Basics_ops['++'], '-', v);
						},
						_rundis$elm_bootstrap$Bootstrap_Grid_Internal$columnCountOption(_p16.columnCount))))));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$colWidthsToAttributes = function (widths) {
	var width = function (w) {
		return A2(_elm_lang$core$Maybe$map, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$colWidthClass, w);
	};
	return A2(
		_elm_lang$core$List$filterMap,
		_elm_lang$core$Basics$identity,
		A2(_elm_lang$core$List$map, width, widths));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$defaultRowOptions = {
	attributes: {ctor: '[]'},
	vAlignXs: _elm_lang$core$Maybe$Nothing,
	vAlignSm: _elm_lang$core$Maybe$Nothing,
	vAlignMd: _elm_lang$core$Maybe$Nothing,
	vAlignLg: _elm_lang$core$Maybe$Nothing,
	vAlignXl: _elm_lang$core$Maybe$Nothing,
	hAlignXs: _elm_lang$core$Maybe$Nothing,
	hAlignSm: _elm_lang$core$Maybe$Nothing,
	hAlignMd: _elm_lang$core$Maybe$Nothing,
	hAlignLg: _elm_lang$core$Maybe$Nothing,
	hAlignXl: _elm_lang$core$Maybe$Nothing
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$defaultColOptions = {
	attributes: {ctor: '[]'},
	widthXs: _elm_lang$core$Maybe$Nothing,
	widthSm: _elm_lang$core$Maybe$Nothing,
	widthMd: _elm_lang$core$Maybe$Nothing,
	widthLg: _elm_lang$core$Maybe$Nothing,
	widthXl: _elm_lang$core$Maybe$Nothing,
	offsetXs: _elm_lang$core$Maybe$Nothing,
	offsetSm: _elm_lang$core$Maybe$Nothing,
	offsetMd: _elm_lang$core$Maybe$Nothing,
	offsetLg: _elm_lang$core$Maybe$Nothing,
	offsetXl: _elm_lang$core$Maybe$Nothing,
	pullXs: _elm_lang$core$Maybe$Nothing,
	pullSm: _elm_lang$core$Maybe$Nothing,
	pullMd: _elm_lang$core$Maybe$Nothing,
	pullLg: _elm_lang$core$Maybe$Nothing,
	pullXl: _elm_lang$core$Maybe$Nothing,
	pushXs: _elm_lang$core$Maybe$Nothing,
	pushSm: _elm_lang$core$Maybe$Nothing,
	pushMd: _elm_lang$core$Maybe$Nothing,
	pushLg: _elm_lang$core$Maybe$Nothing,
	pushXl: _elm_lang$core$Maybe$Nothing,
	alignXs: _elm_lang$core$Maybe$Nothing,
	alignSm: _elm_lang$core$Maybe$Nothing,
	alignMd: _elm_lang$core$Maybe$Nothing,
	alignLg: _elm_lang$core$Maybe$Nothing,
	alignXl: _elm_lang$core$Maybe$Nothing
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyRowHAlign = F2(
	function (align, options) {
		var _p17 = align.screenSize;
		switch (_p17.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						hAlignXs: _elm_lang$core$Maybe$Just(align)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						hAlignSm: _elm_lang$core$Maybe$Just(align)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						hAlignMd: _elm_lang$core$Maybe$Just(align)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						hAlignLg: _elm_lang$core$Maybe$Just(align)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						hAlignXl: _elm_lang$core$Maybe$Just(align)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyRowVAlign = F2(
	function (align, options) {
		var _p18 = align.screenSize;
		switch (_p18.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						vAlignXs: _elm_lang$core$Maybe$Just(align)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						vAlignSm: _elm_lang$core$Maybe$Just(align)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						vAlignMd: _elm_lang$core$Maybe$Just(align)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						vAlignLg: _elm_lang$core$Maybe$Just(align)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						vAlignXl: _elm_lang$core$Maybe$Just(align)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyRowOption = F2(
	function (modifier, options) {
		var _p19 = modifier;
		switch (_p19.ctor) {
			case 'RowAttrs':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p19._0)
					});
			case 'RowVAlign':
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyRowVAlign, _p19._0, options);
			default:
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyRowHAlign, _p19._0, options);
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColAlign = F2(
	function (align, options) {
		var _p20 = align.screenSize;
		switch (_p20.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						alignXs: _elm_lang$core$Maybe$Just(align)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						alignSm: _elm_lang$core$Maybe$Just(align)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						alignMd: _elm_lang$core$Maybe$Just(align)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						alignLg: _elm_lang$core$Maybe$Just(align)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						alignXl: _elm_lang$core$Maybe$Just(align)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColPush = F2(
	function (push, options) {
		var _p21 = push.screenSize;
		switch (_p21.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pushXs: _elm_lang$core$Maybe$Just(push)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pushSm: _elm_lang$core$Maybe$Just(push)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pushMd: _elm_lang$core$Maybe$Just(push)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pushLg: _elm_lang$core$Maybe$Just(push)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pushXl: _elm_lang$core$Maybe$Just(push)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColPull = F2(
	function (pull, options) {
		var _p22 = pull.screenSize;
		switch (_p22.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pullXs: _elm_lang$core$Maybe$Just(pull)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pullSm: _elm_lang$core$Maybe$Just(pull)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pullMd: _elm_lang$core$Maybe$Just(pull)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pullLg: _elm_lang$core$Maybe$Just(pull)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pullXl: _elm_lang$core$Maybe$Just(pull)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColOffset = F2(
	function (offset, options) {
		var _p23 = offset.screenSize;
		switch (_p23.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						offsetXs: _elm_lang$core$Maybe$Just(offset)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						offsetSm: _elm_lang$core$Maybe$Just(offset)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						offsetMd: _elm_lang$core$Maybe$Just(offset)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						offsetLg: _elm_lang$core$Maybe$Just(offset)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						offsetXl: _elm_lang$core$Maybe$Just(offset)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColWidth = F2(
	function (width, options) {
		var _p24 = width.screenSize;
		switch (_p24.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						widthXs: _elm_lang$core$Maybe$Just(width)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						widthSm: _elm_lang$core$Maybe$Just(width)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						widthMd: _elm_lang$core$Maybe$Just(width)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						widthLg: _elm_lang$core$Maybe$Just(width)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						widthXl: _elm_lang$core$Maybe$Just(width)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColOption = F2(
	function (modifier, options) {
		var _p25 = modifier;
		switch (_p25.ctor) {
			case 'ColAttrs':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p25._0)
					});
			case 'ColWidth':
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColWidth, _p25._0, options);
			case 'ColOffset':
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColOffset, _p25._0, options);
			case 'ColPull':
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColPull, _p25._0, options);
			case 'ColPush':
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColPush, _p25._0, options);
			default:
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColAlign, _p25._0, options);
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowAttributes = function (modifiers) {
	var options = A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyRowOption, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$defaultRowOptions, modifiers);
	return A2(
		_elm_lang$core$Basics_ops['++'],
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('row'),
			_1: {ctor: '[]'}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			A2(
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$vAlignsToAttributes,
				'align-items-',
				{
					ctor: '::',
					_0: options.vAlignXs,
					_1: {
						ctor: '::',
						_0: options.vAlignSm,
						_1: {
							ctor: '::',
							_0: options.vAlignMd,
							_1: {
								ctor: '::',
								_0: options.vAlignLg,
								_1: {
									ctor: '::',
									_0: options.vAlignXl,
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}),
			A2(
				_elm_lang$core$Basics_ops['++'],
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$hAlignsToAttributes(
					{
						ctor: '::',
						_0: options.hAlignXs,
						_1: {
							ctor: '::',
							_0: options.hAlignSm,
							_1: {
								ctor: '::',
								_0: options.hAlignMd,
								_1: {
									ctor: '::',
									_0: options.hAlignLg,
									_1: {
										ctor: '::',
										_0: options.hAlignXl,
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}),
				options.attributes)));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Width = F2(
	function (a, b) {
		return {screenSize: a, columnCount: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset = F2(
	function (a, b) {
		return {screenSize: a, offsetCount: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Pull = F2(
	function (a, b) {
		return {screenSize: a, moveCount: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Push = F2(
	function (a, b) {
		return {screenSize: a, moveCount: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$VAlign = F2(
	function (a, b) {
		return {screenSize: a, align: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$HAlign = F2(
	function (a, b) {
		return {screenSize: a, align: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColOptions = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return function (o) {
															return function (p) {
																return function (q) {
																	return function (r) {
																		return function (s) {
																			return function (t) {
																				return function (u) {
																					return function (v) {
																						return function (w) {
																							return function (x) {
																								return function (y) {
																									return function (z) {
																										return {attributes: a, widthXs: b, widthSm: c, widthMd: d, widthLg: e, widthXl: f, offsetXs: g, offsetSm: h, offsetMd: i, offsetLg: j, offsetXl: k, pullXs: l, pullSm: m, pullMd: n, pullLg: o, pullXl: p, pushXs: q, pushSm: r, pushMd: s, pushLg: t, pushXl: u, alignXs: v, alignSm: w, alignMd: x, alignLg: y, alignXl: z};
																									};
																								};
																							};
																						};
																					};
																				};
																			};
																		};
																	};
																};
															};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowOptions = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return {attributes: a, vAlignXs: b, vAlignSm: c, vAlignMd: d, vAlignLg: e, vAlignXl: f, hAlignXs: g, hAlignSm: h, hAlignMd: i, hAlignLg: j, hAlignXl: k};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAttrs = function (a) {
	return {ctor: 'ColAttrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAlign = function (a) {
	return {ctor: 'ColAlign', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign = F2(
	function (size, align) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAlign(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$VAlign, size, align));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColPush = function (a) {
	return {ctor: 'ColPush', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$push = F2(
	function (size, count) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColPush(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$Push, size, count));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColPull = function (a) {
	return {ctor: 'ColPull', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull = F2(
	function (size, count) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColPull(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$Pull, size, count));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColOffset = function (a) {
	return {ctor: 'ColOffset', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset = F2(
	function (size, count) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColOffset(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset, size, count));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColWidth = function (a) {
	return {ctor: 'ColWidth', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$width = F2(
	function (size, count) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColWidth(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$Width, size, count));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowAttrs = function (a) {
	return {ctor: 'RowAttrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowHAlign = function (a) {
	return {ctor: 'RowHAlign', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign = F2(
	function (size, align) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowHAlign(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$HAlign, size, align));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowVAlign = function (a) {
	return {ctor: 'RowVAlign', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign = F2(
	function (size, align) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowVAlign(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$VAlign, size, align));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL = {ctor: 'XL'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG = {ctor: 'LG'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD = {ctor: 'MD'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM = {ctor: 'SM'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS = {ctor: 'XS'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAuto = {ctor: 'ColAuto'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col12 = {ctor: 'Col12'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col11 = {ctor: 'Col11'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col10 = {ctor: 'Col10'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col9 = {ctor: 'Col9'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col8 = {ctor: 'Col8'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col7 = {ctor: 'Col7'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col6 = {ctor: 'Col6'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col5 = {ctor: 'Col5'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col4 = {ctor: 'Col4'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col3 = {ctor: 'Col3'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col2 = {ctor: 'Col2'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col1 = {ctor: 'Col1'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col = {ctor: 'Col'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$colAttributes = function (modifiers) {
	var options = A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColOption, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$defaultColOptions, modifiers);
	var shouldAddDefaultXs = _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$List$length(
			A2(
				_elm_lang$core$List$filterMap,
				_elm_lang$core$Basics$identity,
				{
					ctor: '::',
					_0: options.widthXs,
					_1: {
						ctor: '::',
						_0: options.widthSm,
						_1: {
							ctor: '::',
							_0: options.widthMd,
							_1: {
								ctor: '::',
								_0: options.widthLg,
								_1: {
									ctor: '::',
									_0: options.widthXl,
									_1: {ctor: '[]'}
								}
							}
						}
					}
				})),
		0);
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colWidthsToAttributes(
			{
				ctor: '::',
				_0: shouldAddDefaultXs ? _elm_lang$core$Maybe$Just(
					A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$Width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col)) : options.widthXs,
				_1: {
					ctor: '::',
					_0: options.widthSm,
					_1: {
						ctor: '::',
						_0: options.widthMd,
						_1: {
							ctor: '::',
							_0: options.widthLg,
							_1: {
								ctor: '::',
								_0: options.widthXl,
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}),
		A2(
			_elm_lang$core$Basics_ops['++'],
			_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offsetsToAttributes(
				{
					ctor: '::',
					_0: options.offsetXs,
					_1: {
						ctor: '::',
						_0: options.offsetSm,
						_1: {
							ctor: '::',
							_0: options.offsetMd,
							_1: {
								ctor: '::',
								_0: options.offsetLg,
								_1: {
									ctor: '::',
									_0: options.offsetXl,
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}),
			A2(
				_elm_lang$core$Basics_ops['++'],
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pullsToAttributes(
					{
						ctor: '::',
						_0: options.pullXs,
						_1: {
							ctor: '::',
							_0: options.pullSm,
							_1: {
								ctor: '::',
								_0: options.pullMd,
								_1: {
									ctor: '::',
									_0: options.pullLg,
									_1: {
										ctor: '::',
										_0: options.pullXl,
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}),
				A2(
					_elm_lang$core$Basics_ops['++'],
					_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pushesToAttributes(
						{
							ctor: '::',
							_0: options.pushXs,
							_1: {
								ctor: '::',
								_0: options.pushSm,
								_1: {
									ctor: '::',
									_0: options.pushMd,
									_1: {
										ctor: '::',
										_0: options.pushLg,
										_1: {
											ctor: '::',
											_0: options.pushXl,
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}),
					A2(
						_elm_lang$core$Basics_ops['++'],
						A2(
							_rundis$elm_bootstrap$Bootstrap_Grid_Internal$vAlignsToAttributes,
							'align-self-',
							{
								ctor: '::',
								_0: options.alignXs,
								_1: {
									ctor: '::',
									_0: options.alignSm,
									_1: {
										ctor: '::',
										_0: options.alignMd,
										_1: {
											ctor: '::',
											_0: options.alignLg,
											_1: {
												ctor: '::',
												_0: options.alignXl,
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}),
						options.attributes)))));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset11 = {ctor: 'Offset11'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset10 = {ctor: 'Offset10'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset9 = {ctor: 'Offset9'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset8 = {ctor: 'Offset8'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset7 = {ctor: 'Offset7'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset6 = {ctor: 'Offset6'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset5 = {ctor: 'Offset5'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset4 = {ctor: 'Offset4'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset3 = {ctor: 'Offset3'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset2 = {ctor: 'Offset2'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset1 = {ctor: 'Offset1'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset0 = {ctor: 'Offset0'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12 = {ctor: 'Move12'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11 = {ctor: 'Move11'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10 = {ctor: 'Move10'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9 = {ctor: 'Move9'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8 = {ctor: 'Move8'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7 = {ctor: 'Move7'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6 = {ctor: 'Move6'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5 = {ctor: 'Move5'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4 = {ctor: 'Move4'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3 = {ctor: 'Move3'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2 = {ctor: 'Move2'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1 = {ctor: 'Move1'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0 = {ctor: 'Move0'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom = {ctor: 'Bottom'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle = {ctor: 'Middle'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top = {ctor: 'Top'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Between = {ctor: 'Between'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Around = {ctor: 'Around'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Right = {ctor: 'Right'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Center = {ctor: 'Center'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Left = {ctor: 'Left'};

var _rundis$elm_bootstrap$Bootstrap_Internal_Button$roleClass = function (role) {
	var _p0 = role;
	switch (_p0.ctor) {
		case 'Primary':
			return 'primary';
		case 'Secondary':
			return 'secondary';
		case 'Success':
			return 'success';
		case 'Info':
			return 'info';
		case 'Warning':
			return 'warning';
		case 'Danger':
			return 'danger';
		default:
			return 'link';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$applyModifier = F2(
	function (modifier, options) {
		var _p1 = modifier;
		switch (_p1.ctor) {
			case 'Size':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						size: _elm_lang$core$Maybe$Just(_p1._0)
					});
			case 'Coloring':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						coloring: _elm_lang$core$Maybe$Just(_p1._0)
					});
			case 'Block':
				return _elm_lang$core$Native_Utils.update(
					options,
					{block: true});
			case 'Disabled':
				return _elm_lang$core$Native_Utils.update(
					options,
					{disabled: _p1._0});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p1._0)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$defaultOptions = {
	coloring: _elm_lang$core$Maybe$Nothing,
	block: false,
	disabled: false,
	size: _elm_lang$core$Maybe$Nothing,
	attributes: {ctor: '[]'}
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$buttonAttributes = function (modifiers) {
	var options = A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_Internal_Button$applyModifier, _rundis$elm_bootstrap$Bootstrap_Internal_Button$defaultOptions, modifiers);
	return A2(
		_elm_lang$core$Basics_ops['++'],
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$classList(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'btn', _1: true},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'btn-block', _1: options.block},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'disabled', _1: options.disabled},
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$disabled(options.disabled),
				_1: {ctor: '[]'}
			}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			function () {
				var _p2 = A2(_elm_lang$core$Maybe$andThen, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeOption, options.size);
				if (_p2.ctor === 'Just') {
					return {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class(
							A2(_elm_lang$core$Basics_ops['++'], 'btn-', _p2._0)),
						_1: {ctor: '[]'}
					};
				} else {
					return {ctor: '[]'};
				}
			}(),
			A2(
				_elm_lang$core$Basics_ops['++'],
				function () {
					var _p3 = options.coloring;
					if (_p3.ctor === 'Just') {
						if (_p3._0.ctor === 'Roled') {
							return {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class(
									A2(
										_elm_lang$core$Basics_ops['++'],
										'btn-',
										_rundis$elm_bootstrap$Bootstrap_Internal_Button$roleClass(_p3._0._0))),
								_1: {ctor: '[]'}
							};
						} else {
							return {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class(
									A2(
										_elm_lang$core$Basics_ops['++'],
										'btn-outline-',
										_rundis$elm_bootstrap$Bootstrap_Internal_Button$roleClass(_p3._0._0))),
								_1: {ctor: '[]'}
							};
						}
					} else {
						return {ctor: '[]'};
					}
				}(),
				options.attributes)));
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Options = F5(
	function (a, b, c, d, e) {
		return {coloring: a, block: b, disabled: c, size: d, attributes: e};
	});
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Attrs = function (a) {
	return {ctor: 'Attrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Disabled = function (a) {
	return {ctor: 'Disabled', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Block = {ctor: 'Block'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring = function (a) {
	return {ctor: 'Coloring', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Size = function (a) {
	return {ctor: 'Size', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined = function (a) {
	return {ctor: 'Outlined', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled = function (a) {
	return {ctor: 'Roled', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Link = {ctor: 'Link'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Danger = {ctor: 'Danger'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Warning = {ctor: 'Warning'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Info = {ctor: 'Info'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Success = {ctor: 'Success'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Secondary = {ctor: 'Secondary'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Primary = {ctor: 'Primary'};

var _rundis$elm_bootstrap$Bootstrap_Button$disabled = function (disabled) {
	return _rundis$elm_bootstrap$Bootstrap_Internal_Button$Disabled(disabled);
};
var _rundis$elm_bootstrap$Bootstrap_Button$block = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Block;
var _rundis$elm_bootstrap$Bootstrap_Button$outlineDanger = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Danger));
var _rundis$elm_bootstrap$Bootstrap_Button$outlineWarning = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Warning));
var _rundis$elm_bootstrap$Bootstrap_Button$outlineInfo = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Info));
var _rundis$elm_bootstrap$Bootstrap_Button$outlineSuccess = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Success));
var _rundis$elm_bootstrap$Bootstrap_Button$outlineSecondary = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Secondary));
var _rundis$elm_bootstrap$Bootstrap_Button$outlinePrimary = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Primary));
var _rundis$elm_bootstrap$Bootstrap_Button$roleLink = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Link));
var _rundis$elm_bootstrap$Bootstrap_Button$danger = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Danger));
var _rundis$elm_bootstrap$Bootstrap_Button$warning = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Warning));
var _rundis$elm_bootstrap$Bootstrap_Button$info = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Info));
var _rundis$elm_bootstrap$Bootstrap_Button$success = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Success));
var _rundis$elm_bootstrap$Bootstrap_Button$secondary = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Secondary));
var _rundis$elm_bootstrap$Bootstrap_Button$primary = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Primary));
var _rundis$elm_bootstrap$Bootstrap_Button$large = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Size(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG);
var _rundis$elm_bootstrap$Bootstrap_Button$small = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Size(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM);
var _rundis$elm_bootstrap$Bootstrap_Button$attrs = function (attrs) {
	return _rundis$elm_bootstrap$Bootstrap_Internal_Button$Attrs(attrs);
};
var _rundis$elm_bootstrap$Bootstrap_Button$onClick = function (message) {
	var defaultOptions = _elm_lang$html$Html_Events$defaultOptions;
	return _rundis$elm_bootstrap$Bootstrap_Button$attrs(
		{
			ctor: '::',
			_0: A3(
				_elm_lang$html$Html_Events$onWithOptions,
				'click',
				_elm_lang$core$Native_Utils.update(
					defaultOptions,
					{preventDefault: true}),
				_elm_lang$core$Json_Decode$succeed(message)),
			_1: {ctor: '[]'}
		});
};
var _rundis$elm_bootstrap$Bootstrap_Button$checkboxButton = F3(
	function (checked, options, children) {
		return A2(
			_elm_lang$html$Html$label,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'active', _1: checked},
						_1: {ctor: '[]'}
					}),
				_1: _rundis$elm_bootstrap$Bootstrap_Internal_Button$buttonAttributes(options)
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('checkbox'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$checked(checked),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$autocomplete(false),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: children
			});
	});
var _rundis$elm_bootstrap$Bootstrap_Button$radioButton = F3(
	function (checked, options, children) {
		var hideRadio = A2(_elm_lang$html$Html_Attributes$attribute, 'data-toggle', 'button');
		return A2(
			_elm_lang$html$Html$label,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'active', _1: checked},
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: hideRadio,
					_1: _rundis$elm_bootstrap$Bootstrap_Internal_Button$buttonAttributes(options)
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('radio'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$checked(checked),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$autocomplete(false),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: children
			});
	});
var _rundis$elm_bootstrap$Bootstrap_Button$linkButton = F2(
	function (options, children) {
		return A2(
			_elm_lang$html$Html$a,
			{
				ctor: '::',
				_0: A2(_elm_lang$html$Html_Attributes$attribute, 'role', 'button'),
				_1: _rundis$elm_bootstrap$Bootstrap_Internal_Button$buttonAttributes(options)
			},
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Button$button = F2(
	function (options, children) {
		return A2(
			_elm_lang$html$Html$button,
			_rundis$elm_bootstrap$Bootstrap_Internal_Button$buttonAttributes(options),
			children);
	});

var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$defaultOptions = {
	size: _elm_lang$core$Maybe$Nothing,
	vertical: false,
	attributes: {ctor: '[]'}
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$applyModifier = F2(
	function (modifier, options) {
		var _p0 = modifier;
		switch (_p0.ctor) {
			case 'Size':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						size: _elm_lang$core$Maybe$Just(_p0._0)
					});
			case 'Vertical':
				return _elm_lang$core$Native_Utils.update(
					options,
					{vertical: true});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p0._0)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$groupAttributes = function (modifiers) {
	var options = A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_ButtonGroup$applyModifier, _rundis$elm_bootstrap$Bootstrap_ButtonGroup$defaultOptions, modifiers);
	return A2(
		_elm_lang$core$Basics_ops['++'],
		{
			ctor: '::',
			_0: A2(_elm_lang$html$Html_Attributes$attribute, 'role', 'group'),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'btn-group', _1: true},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'btn-group-vertical', _1: options.vertical},
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: A2(_elm_lang$html$Html_Attributes$attribute, 'data-toggle', 'buttons'),
					_1: {ctor: '[]'}
				}
			}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			function () {
				var _p1 = A2(_elm_lang$core$Maybe$andThen, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeOption, options.size);
				if (_p1.ctor === 'Just') {
					return {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class(
							A2(_elm_lang$core$Basics_ops['++'], 'btn-group-', _p1._0)),
						_1: {ctor: '[]'}
					};
				} else {
					return {ctor: '[]'};
				}
			}(),
			options.attributes));
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$renderGroup = function (_p2) {
	var _p3 = _p2;
	return _p3._0;
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$toolbar = F2(
	function (attributes, items) {
		return A2(
			_elm_lang$html$Html$div,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: A2(_elm_lang$html$Html_Attributes$attribute, 'role', 'toolbar'),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('btn-toolbar'),
						_1: {ctor: '[]'}
					}
				},
				attributes),
			A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_ButtonGroup$renderGroup, items));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$Options = F3(
	function (a, b, c) {
		return {size: a, vertical: b, attributes: c};
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$Attrs = function (a) {
	return {ctor: 'Attrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$attrs = function (attrs) {
	return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$Attrs(attrs);
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$Vertical = {ctor: 'Vertical'};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$vertical = _rundis$elm_bootstrap$Bootstrap_ButtonGroup$Vertical;
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$Size = function (a) {
	return {ctor: 'Size', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$small = _rundis$elm_bootstrap$Bootstrap_ButtonGroup$Size(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM);
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$large = _rundis$elm_bootstrap$Bootstrap_ButtonGroup$Size(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG);
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$GroupItem = function (a) {
	return {ctor: 'GroupItem', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$buttonGroupItem = F2(
	function (options, items) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$GroupItem(
			A2(
				_elm_lang$html$Html$div,
				_rundis$elm_bootstrap$Bootstrap_ButtonGroup$groupAttributes(options),
				A2(
					_elm_lang$core$List$map,
					function (_p4) {
						var _p5 = _p4;
						return _p5._0;
					},
					items)));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$buttonGroup = F2(
	function (options, items) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$renderGroup(
			A2(_rundis$elm_bootstrap$Bootstrap_ButtonGroup$buttonGroupItem, options, items));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$linkButtonGroupItem = F2(
	function (options, items) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$GroupItem(
			A2(
				_elm_lang$html$Html$div,
				_rundis$elm_bootstrap$Bootstrap_ButtonGroup$groupAttributes(options),
				A2(
					_elm_lang$core$List$map,
					function (_p6) {
						var _p7 = _p6;
						return _p7._0;
					},
					items)));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$linkButtonGroup = F2(
	function (options, items) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$renderGroup(
			A2(_rundis$elm_bootstrap$Bootstrap_ButtonGroup$linkButtonGroupItem, options, items));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$radioButtonGroupItem = F2(
	function (options, items) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$GroupItem(
			A2(
				_elm_lang$html$Html$div,
				_rundis$elm_bootstrap$Bootstrap_ButtonGroup$groupAttributes(options),
				A2(
					_elm_lang$core$List$map,
					function (_p8) {
						var _p9 = _p8;
						return _p9._0;
					},
					items)));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$radioButtonGroup = F2(
	function (options, items) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$renderGroup(
			A2(_rundis$elm_bootstrap$Bootstrap_ButtonGroup$radioButtonGroupItem, options, items));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$checkboxButtonGroupItem = F2(
	function (options, items) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$GroupItem(
			A2(
				_elm_lang$html$Html$div,
				_rundis$elm_bootstrap$Bootstrap_ButtonGroup$groupAttributes(options),
				A2(
					_elm_lang$core$List$map,
					function (_p10) {
						var _p11 = _p10;
						return _p11._0;
					},
					items)));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$checkboxButtonGroup = F2(
	function (options, items) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$renderGroup(
			A2(_rundis$elm_bootstrap$Bootstrap_ButtonGroup$checkboxButtonGroupItem, options, items));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$ButtonItem = function (a) {
	return {ctor: 'ButtonItem', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$button = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$ButtonItem(
			A2(_rundis$elm_bootstrap$Bootstrap_Button$button, options, children));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$LinkButtonItem = function (a) {
	return {ctor: 'LinkButtonItem', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$linkButton = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$LinkButtonItem(
			A2(_rundis$elm_bootstrap$Bootstrap_Button$linkButton, options, children));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$RadioButtonItem = function (a) {
	return {ctor: 'RadioButtonItem', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$radioButton = F3(
	function (checked, options, children) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$RadioButtonItem(
			A3(_rundis$elm_bootstrap$Bootstrap_Button$radioButton, checked, options, children));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$CheckboxButtonItem = function (a) {
	return {ctor: 'CheckboxButtonItem', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$checkboxButton = F3(
	function (checked, options, children) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$CheckboxButtonItem(
			A3(_rundis$elm_bootstrap$Bootstrap_Button$checkboxButton, checked, options, children));
	});

var _rundis$elm_bootstrap$Bootstrap_Form_FormInternal$validationToString = function (validation) {
	var _p0 = validation;
	switch (_p0.ctor) {
		case 'Success':
			return 'success';
		case 'Warning':
			return 'warning';
		default:
			return 'danger';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Form_FormInternal$validationWrapperAttribute = function (validation) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'has-',
			_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$validationToString(validation)));
};
var _rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Danger = {ctor: 'Danger'};
var _rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Warning = {ctor: 'Warning'};
var _rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Success = {ctor: 'Success'};

var _rundis$elm_bootstrap$Bootstrap_Grid_Row$betweenXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Between);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$betweenLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Between);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$betweenMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Between);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$betweenSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Between);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$betweenXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Between);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$aroundXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Around);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$aroundLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Around);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$aroundMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Around);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$aroundSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Around);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$aroundXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Around);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$rightXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Right);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$rightLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Right);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$rightMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Right);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$rightSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Right);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$rightXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Right);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$centerXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Center);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$centerLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Center);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$centerMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Center);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$centerSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Center);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$centerXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Center);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$leftXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Left);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$leftLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Left);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$leftMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Left);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$leftSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Left);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$leftXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Left);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$bottomXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$bottomLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$bottomMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$bottomSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$bottomXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$middleXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$middleLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$middleMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$middleSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$middleXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$topXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$topLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$topMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$topSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$topXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$attrs = function (attrs) {
	return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowAttrs(attrs);
};

var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xlAuto = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAuto);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lgAuto = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAuto);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$mdAuto = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAuto);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$smAuto = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAuto);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xsAuto = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAuto);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$bottomXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$bottomLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$bottomMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$bottomSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$bottomXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$middleXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$middleLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$middleMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$middleSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$middleXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$topXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$topLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$topMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$topSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$topXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$attrs = function (attrs) {
	return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAttrs(attrs);
};

var _rundis$elm_bootstrap$Bootstrap_Form$renderCol = function (_p0) {
	var _p1 = _p0;
	return A2(
		_p1._0.elemFn,
		_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colAttributes(_p1._0.options),
		_p1._0.children);
};
var _rundis$elm_bootstrap$Bootstrap_Form$rowValidation = function (validation) {
	return _rundis$elm_bootstrap$Bootstrap_Grid_Row$attrs(
		{
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Form_FormInternal$validationWrapperAttribute(validation),
			_1: {ctor: '[]'}
		});
};
var _rundis$elm_bootstrap$Bootstrap_Form$rowDanger = _rundis$elm_bootstrap$Bootstrap_Form$rowValidation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Danger);
var _rundis$elm_bootstrap$Bootstrap_Form$rowWarning = _rundis$elm_bootstrap$Bootstrap_Form$rowValidation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Warning);
var _rundis$elm_bootstrap$Bootstrap_Form$rowSuccess = _rundis$elm_bootstrap$Bootstrap_Form$rowValidation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Success);
var _rundis$elm_bootstrap$Bootstrap_Form$row = F2(
	function (options, cols) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('form-group'),
				_1: _rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowAttributes(options)
			},
			A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Form$renderCol, cols));
	});
var _rundis$elm_bootstrap$Bootstrap_Form$applyModifier = F2(
	function (modifier, options) {
		var _p2 = modifier;
		if (_p2.ctor === 'Validation') {
			return _elm_lang$core$Native_Utils.update(
				options,
				{
					validation: _elm_lang$core$Maybe$Just(_p2._0)
				});
		} else {
			return _elm_lang$core$Native_Utils.update(
				options,
				{
					attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p2._0)
				});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Form$defaultOptions = {
	validation: _elm_lang$core$Maybe$Nothing,
	attributes: {ctor: '[]'}
};
var _rundis$elm_bootstrap$Bootstrap_Form$toAttributes = function (modifiers) {
	var options = A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_Form$applyModifier, _rundis$elm_bootstrap$Bootstrap_Form$defaultOptions, modifiers);
	return A2(
		_elm_lang$core$Basics_ops['++'],
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('form-group'),
			_1: {ctor: '[]'}
		},
		function () {
			var _p3 = options.validation;
			if (_p3.ctor === 'Just') {
				return {
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Form_FormInternal$validationWrapperAttribute(_p3._0),
					_1: {ctor: '[]'}
				};
			} else {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					{ctor: '[]'},
					options.attributes);
			}
		}());
};
var _rundis$elm_bootstrap$Bootstrap_Form$validationText = F2(
	function (attributes, children) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('form-control-feedback'),
				_1: attributes
			},
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Form$helpInline = F2(
	function (attributes, children) {
		return A2(
			_elm_lang$html$Html$small,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('text-muted'),
				_1: attributes
			},
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Form$help = F2(
	function (attributes, children) {
		return A2(
			_elm_lang$html$Html$small,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('form-text text-muted'),
				_1: attributes
			},
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Form$label = F2(
	function (attributes, children) {
		return A2(
			_elm_lang$html$Html$label,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('form-control-label'),
				_1: attributes
			},
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Form$group = F2(
	function (options, children) {
		return A2(
			_elm_lang$html$Html$div,
			_rundis$elm_bootstrap$Bootstrap_Form$toAttributes(options),
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Form$form = F2(
	function (attributes, children) {
		return A2(_elm_lang$html$Html$form, attributes, children);
	});
var _rundis$elm_bootstrap$Bootstrap_Form$formInline = function (attributes) {
	return _rundis$elm_bootstrap$Bootstrap_Form$form(
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('form-inline'),
			_1: attributes
		});
};
var _rundis$elm_bootstrap$Bootstrap_Form$Options = F2(
	function (a, b) {
		return {validation: a, attributes: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Form$Col = function (a) {
	return {ctor: 'Col', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form$col = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_Form$Col(
			{elemFn: _elm_lang$html$Html$div, options: options, children: children});
	});
var _rundis$elm_bootstrap$Bootstrap_Form$colLabel = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_Form$Col(
			{
				elemFn: _elm_lang$html$Html$label,
				options: {
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$attrs(
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('col-form-label'),
							_1: {ctor: '[]'}
						}),
					_1: options
				},
				children: children
			});
	});
var _rundis$elm_bootstrap$Bootstrap_Form$colLabelSm = function (options) {
	return _rundis$elm_bootstrap$Bootstrap_Form$colLabel(
		{
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$attrs(
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('col-form-label-sm'),
					_1: {ctor: '[]'}
				}),
			_1: options
		});
};
var _rundis$elm_bootstrap$Bootstrap_Form$colLabelLg = function (options) {
	return _rundis$elm_bootstrap$Bootstrap_Form$colLabel(
		{
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$attrs(
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('col-form-label-lg'),
					_1: {ctor: '[]'}
				}),
			_1: options
		});
};
var _rundis$elm_bootstrap$Bootstrap_Form$Attrs = function (a) {
	return {ctor: 'Attrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form$Validation = function (a) {
	return {ctor: 'Validation', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form$groupSuccess = _rundis$elm_bootstrap$Bootstrap_Form$Validation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Success);
var _rundis$elm_bootstrap$Bootstrap_Form$groupWarning = _rundis$elm_bootstrap$Bootstrap_Form$Validation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Warning);
var _rundis$elm_bootstrap$Bootstrap_Form$groupDanger = _rundis$elm_bootstrap$Bootstrap_Form$Validation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Danger);

var _rundis$elm_bootstrap$Bootstrap_Grid$renderCol = function (column) {
	var _p0 = column;
	switch (_p0.ctor) {
		case 'Column':
			return A2(
				_elm_lang$html$Html$div,
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colAttributes(_p0._0.options),
				_p0._0.children);
		case 'ColBreak':
			return _p0._0;
		default:
			return A3(
				_elm_lang$html$Html_Keyed$node,
				'div',
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colAttributes(_p0._0.options),
				_p0._0.children);
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid$keyedRow = F2(
	function (options, keyedCols) {
		return A3(
			_elm_lang$html$Html_Keyed$node,
			'div',
			_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowAttributes(options),
			A2(
				_elm_lang$core$List$map,
				function (_p1) {
					var _p2 = _p1;
					return {
						ctor: '_Tuple2',
						_0: _p2._0,
						_1: _rundis$elm_bootstrap$Bootstrap_Grid$renderCol(_p2._1)
					};
				},
				keyedCols));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid$row = F2(
	function (options, cols) {
		return A2(
			_elm_lang$html$Html$div,
			_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowAttributes(options),
			A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Grid$renderCol, cols));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid$simpleRow = function (cols) {
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Grid$row,
		{ctor: '[]'},
		cols);
};
var _rundis$elm_bootstrap$Bootstrap_Grid$containerFluid = F2(
	function (attributes, children) {
		return A2(
			_elm_lang$html$Html$div,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('container-fluid'),
					_1: {ctor: '[]'}
				},
				attributes),
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Grid$container = F2(
	function (attributes, children) {
		return A2(
			_elm_lang$html$Html$div,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('container'),
					_1: {ctor: '[]'}
				},
				attributes),
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Grid$KeyedColumn = function (a) {
	return {ctor: 'KeyedColumn', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid$keyedCol = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_Grid$KeyedColumn(
			{options: options, children: children});
	});
var _rundis$elm_bootstrap$Bootstrap_Grid$ColBreak = function (a) {
	return {ctor: 'ColBreak', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid$colBreak = function (attributes) {
	return _rundis$elm_bootstrap$Bootstrap_Grid$ColBreak(
		A2(
			_elm_lang$html$Html$div,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('w-100'),
					_1: {ctor: '[]'}
				},
				attributes),
			{ctor: '[]'}));
};
var _rundis$elm_bootstrap$Bootstrap_Grid$Column = function (a) {
	return {ctor: 'Column', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid$col = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_Grid$Column(
			{options: options, children: children});
	});

var _simonh1000$elm_colorpicker$ColorPicker$decodePoint = A3(
	_elm_lang$core$Json_Decode$map2,
	F2(
		function (v0, v1) {
			return {ctor: '_Tuple2', _0: v0, _1: v1};
		}),
	A2(_elm_lang$core$Json_Decode$field, 'offsetX', _elm_lang$core$Json_Decode$int),
	A2(_elm_lang$core$Json_Decode$field, 'offsetY', _elm_lang$core$Json_Decode$int));
var _simonh1000$elm_colorpicker$ColorPicker$onMouseMovePos = function (msgCreator) {
	return A2(
		_elm_lang$svg$Svg_Events$on,
		'mousemove',
		A2(_elm_lang$core$Json_Decode$map, msgCreator, _simonh1000$elm_colorpicker$ColorPicker$decodePoint));
};
var _simonh1000$elm_colorpicker$ColorPicker$onClickSvg = function (msgCreator) {
	return A2(
		_elm_lang$svg$Svg_Events$on,
		'click',
		A2(_elm_lang$core$Json_Decode$map, msgCreator, _simonh1000$elm_colorpicker$ColorPicker$decodePoint));
};
var _simonh1000$elm_colorpicker$ColorPicker$padHex = function (x) {
	return (_elm_lang$core$Native_Utils.cmp(x, 16) < 0) ? A2(
		_elm_lang$core$Basics_ops['++'],
		'0',
		_rtfeldman$hex$Hex$toString(x)) : _rtfeldman$hex$Hex$toString(x);
};
var _simonh1000$elm_colorpicker$ColorPicker$pickerStyles = _elm_lang$html$Html_Attributes$style(
	{
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: 'cursor', _1: 'crosshair'},
		_1: {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: 'position', _1: 'relative'},
			_1: {ctor: '[]'}
		}
	});
var _simonh1000$elm_colorpicker$ColorPicker$hex2Color = function (s) {
	var conv = F2(
		function (begin, end) {
			return function (_p0) {
				return _rtfeldman$hex$Hex$fromString(
					A3(_elm_lang$core$String$slice, begin, end, _p0));
			};
		});
	var hex = _elm_lang$core$String$toLower(s);
	var _p1 = {
		ctor: '_Tuple3',
		_0: A3(conv, 1, 3, hex),
		_1: A3(conv, 3, 5, hex),
		_2: A3(conv, 5, 7, hex)
	};
	if ((((_p1.ctor === '_Tuple3') && (_p1._0.ctor === 'Ok')) && (_p1._1.ctor === 'Ok')) && (_p1._2.ctor === 'Ok')) {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$Color$rgb, _p1._0._0, _p1._1._0, _p1._2._0));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _simonh1000$elm_colorpicker$ColorPicker$color2Hex = function (col) {
	var _p2 = _elm_lang$core$Color$toRgb(col);
	var red = _p2.red;
	var green = _p2.green;
	var blue = _p2.blue;
	return A2(
		F2(
			function (x, y) {
				return A2(_elm_lang$core$Basics_ops['++'], x, y);
			}),
		'#',
		A2(
			_elm_lang$core$String$join,
			'',
			A2(
				_elm_lang$core$List$map,
				_simonh1000$elm_colorpicker$ColorPicker$padHex,
				{
					ctor: '::',
					_0: red,
					_1: {
						ctor: '::',
						_0: green,
						_1: {
							ctor: '::',
							_0: blue,
							_1: {ctor: '[]'}
						}
					}
				})));
};
var _simonh1000$elm_colorpicker$ColorPicker$dragAttrs = F3(
	function (mouseDown, mouseDownMsg, clickMsg) {
		var common = {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Events$onMouseDown(
				mouseDownMsg(true)),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Events$onMouseUp(
					mouseDownMsg(false)),
				_1: {
					ctor: '::',
					_0: _simonh1000$elm_colorpicker$ColorPicker$onClickSvg(clickMsg),
					_1: {ctor: '[]'}
				}
			}
		};
		return mouseDown ? {
			ctor: '::',
			_0: _simonh1000$elm_colorpicker$ColorPicker$onMouseMovePos(clickMsg),
			_1: common
		} : {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Events$onMouseOut(
				mouseDownMsg(false)),
			_1: common
		};
	});
var _simonh1000$elm_colorpicker$ColorPicker$safeToHsl = F2(
	function (lastHue, col) {
		var _p3 = _elm_lang$core$Color$toHsl(col);
		var hsl = _p3;
		var hue = _p3.hue;
		var saturation = _p3.saturation;
		var lightness = _p3.lightness;
		var hue_ = _elm_lang$core$Basics$isNaN(hue) ? lastHue : hue;
		var sat_ = _elm_lang$core$Basics$isNaN(saturation) ? 0 : saturation;
		return {hue: hue_, saturation: sat_, lightness: lightness, alpha: 1};
	});
var _simonh1000$elm_colorpicker$ColorPicker$pickerIndicator = F2(
	function (lastHue, col) {
		var _p4 = A2(_simonh1000$elm_colorpicker$ColorPicker$safeToHsl, lastHue, col);
		var saturation = _p4.saturation;
		var lightness = _p4.lightness;
		var borderColor = (_elm_lang$core$Native_Utils.cmp(lightness, 0.95) > 0) ? '#cccccc' : '#ffffff';
		var cx_ = _elm_lang$core$Basics$toString(
			_elm_lang$core$Basics$round((saturation * 200) - 3));
		var cy_ = _elm_lang$core$Basics$toString(
			_elm_lang$core$Basics$round((150 - (lightness * 150)) - 3));
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'position', _1: 'absolute'},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'top',
								_1: A2(_elm_lang$core$Basics_ops['++'], cy_, 'px')
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: 'left',
									_1: A2(_elm_lang$core$Basics_ops['++'], cx_, 'px')
								},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'border-radius', _1: '100%'},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'border',
											_1: A2(_elm_lang$core$Basics_ops['++'], '2px solid ', borderColor)
										},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'width', _1: '6px'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'height', _1: '6px'},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'pointer-events', _1: 'none'},
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}),
				_1: {ctor: '[]'}
			},
			{ctor: '[]'});
	});
var _simonh1000$elm_colorpicker$ColorPicker$sliderIndicator = F2(
	function (lastHue, col) {
		var _p5 = A2(_simonh1000$elm_colorpicker$ColorPicker$safeToHsl, lastHue, col);
		var hue = _p5.hue;
		var xVal = _elm_lang$core$Basics$toString(
			_elm_lang$core$Basics$round((((hue / 2) / _elm_lang$core$Basics$pi) * 200) - 4));
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'position', _1: 'absolute'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'top', _1: '-3px'},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: 'left',
									_1: A2(_elm_lang$core$Basics_ops['++'], xVal, 'px')
								},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'border', _1: '3px solid #ddd'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'height', _1: '26px'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'width', _1: '9px'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'pointer-events', _1: 'none'},
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}),
				_1: {ctor: '[]'}
			},
			{ctor: '[]'});
	});
var _simonh1000$elm_colorpicker$ColorPicker$Model = F3(
	function (a, b, c) {
		return {pickerMouseDown: a, sliderMouseDown: b, lastHue: c};
	});
var _simonh1000$elm_colorpicker$ColorPicker$State = function (a) {
	return {ctor: 'State', _0: a};
};
var _simonh1000$elm_colorpicker$ColorPicker$empty = _simonh1000$elm_colorpicker$ColorPicker$State(
	{pickerMouseDown: false, sliderMouseDown: false, lastHue: _elm_lang$core$Basics$pi});
var _simonh1000$elm_colorpicker$ColorPicker$update = F3(
	function (message, col, _p6) {
		var _p7 = _p6;
		var _p11 = _p7._0;
		var _p8 = message;
		switch (_p8.ctor) {
			case 'PickerClick':
				var _p9 = A2(_simonh1000$elm_colorpicker$ColorPicker$safeToHsl, _p11.lastHue, col);
				var hue = _p9.hue;
				var newColour = A3(
					_elm_lang$core$Color$hsl,
					hue,
					_elm_lang$core$Basics$toFloat(_p8._0._0) / 200,
					1 - (_elm_lang$core$Basics$toFloat(_p8._0._1) / 150));
				return {
					ctor: '_Tuple2',
					_0: _simonh1000$elm_colorpicker$ColorPicker$State(_p11),
					_1: _elm_lang$core$Maybe$Just(newColour)
				};
			case 'PickerMouseDown':
				return {
					ctor: '_Tuple2',
					_0: _simonh1000$elm_colorpicker$ColorPicker$State(
						_elm_lang$core$Native_Utils.update(
							_p11,
							{pickerMouseDown: _p8._0})),
					_1: _elm_lang$core$Maybe$Nothing
				};
			case 'SliderClick':
				var hue = ((_elm_lang$core$Basics$toFloat(_p8._0._0) / 200) * 2) * _elm_lang$core$Basics$pi;
				var _p10 = A2(_simonh1000$elm_colorpicker$ColorPicker$safeToHsl, _p11.lastHue, col);
				var saturation = _p10.saturation;
				var lightness = _p10.lightness;
				var newColour = (_elm_lang$core$Native_Utils.eq(saturation, 0) && (_elm_lang$core$Native_Utils.cmp(lightness, 2.0e-2) < 0)) ? A3(_elm_lang$core$Color$hsl, hue, 0.5, 0.5) : A3(_elm_lang$core$Color$hsl, hue, saturation, lightness);
				return {
					ctor: '_Tuple2',
					_0: _simonh1000$elm_colorpicker$ColorPicker$State(
						_elm_lang$core$Native_Utils.update(
							_p11,
							{lastHue: hue})),
					_1: _elm_lang$core$Maybe$Just(newColour)
				};
			case 'SliderMouseDown':
				return {
					ctor: '_Tuple2',
					_0: _simonh1000$elm_colorpicker$ColorPicker$State(
						_elm_lang$core$Native_Utils.update(
							_p11,
							{sliderMouseDown: _p8._0})),
					_1: _elm_lang$core$Maybe$Nothing
				};
			default:
				return {
					ctor: '_Tuple2',
					_0: _simonh1000$elm_colorpicker$ColorPicker$State(_p11),
					_1: _elm_lang$core$Maybe$Nothing
				};
		}
	});
var _simonh1000$elm_colorpicker$ColorPicker$NoOp = {ctor: 'NoOp'};
var _simonh1000$elm_colorpicker$ColorPicker$bubblePreventer = A3(
	_elm_lang$html$Html_Events$onWithOptions,
	'click',
	_elm_lang$core$Native_Utils.update(
		_elm_lang$html$Html_Events$defaultOptions,
		{stopPropagation: true}),
	_elm_lang$core$Json_Decode$succeed(_simonh1000$elm_colorpicker$ColorPicker$NoOp));
var _simonh1000$elm_colorpicker$ColorPicker$SliderMouseDown = function (a) {
	return {ctor: 'SliderMouseDown', _0: a};
};
var _simonh1000$elm_colorpicker$ColorPicker$SliderClick = function (a) {
	return {ctor: 'SliderClick', _0: a};
};
var _simonh1000$elm_colorpicker$ColorPicker$slider = function (_p12) {
	var _p13 = _p12;
	var stops = {
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: '0%', _1: '#FF0000'},
		_1: {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: '17%', _1: '#FF00FF'},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: '33%', _1: '#0000FF'},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: '50%', _1: '#00FFFF'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: '66%', _1: '#00FF00'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: '83%', _1: '#FFFF00'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: '100%', _1: '#FF0000'},
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		}
	};
	var ss = F2(
		function (os, sc) {
			return A2(
				_elm_lang$svg$Svg$stop,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$offset(os),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$stopColor(sc),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stopOpacity('1'),
							_1: {ctor: '[]'}
						}
					}
				},
				{ctor: '[]'});
		});
	return A2(
		_elm_lang$svg$Svg$svg,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$width('200'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$height('20'),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$svg$Svg$defs,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$linearGradient,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$id('gradient-hsv'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$x1('100%'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$y1('0%'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$x2('0%'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$y2('0%'),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						},
						A2(
							_elm_lang$core$List$map,
							_elm_lang$core$Basics$uncurry(ss),
							stops)),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$rect,
					A2(
						_elm_lang$core$Basics_ops['++'],
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$x('0'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$y('0'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$width('100%'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$height('100%'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$fill('url(#gradient-hsv)'),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						},
						A3(_simonh1000$elm_colorpicker$ColorPicker$dragAttrs, _p13.sliderMouseDown, _simonh1000$elm_colorpicker$ColorPicker$SliderMouseDown, _simonh1000$elm_colorpicker$ColorPicker$SliderClick)),
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			}
		});
};
var _simonh1000$elm_colorpicker$ColorPicker$PickerMouseDown = function (a) {
	return {ctor: 'PickerMouseDown', _0: a};
};
var _simonh1000$elm_colorpicker$ColorPicker$PickerClick = function (a) {
	return {ctor: 'PickerClick', _0: a};
};
var _simonh1000$elm_colorpicker$ColorPicker$picker = F2(
	function (col, model) {
		var _p14 = A2(_simonh1000$elm_colorpicker$ColorPicker$safeToHsl, model.lastHue, col);
		var hue = _p14.hue;
		var colHex = _simonh1000$elm_colorpicker$ColorPicker$color2Hex(
			A3(_elm_lang$core$Color$hsl, hue, 1, 0.5));
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width('200'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height('150'),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$defs,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$linearGradient,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$id('pickerSaturation'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$stop,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$offset('0'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$stopColor('#808080'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$stopOpacity('1'),
												_1: {ctor: '[]'}
											}
										}
									},
									{ctor: '[]'}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$svg$Svg$stop,
										{
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$offset('1'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$stopColor('#808080'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$stopOpacity('0'),
													_1: {ctor: '[]'}
												}
											}
										},
										{ctor: '[]'}),
									_1: {ctor: '[]'}
								}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$linearGradient,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$id('pickerBrightness'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$x1('0'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$y1('0'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$x2('0'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$y2('1'),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$svg$Svg$stop,
										{
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$offset('0'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$stopColor('#fff'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$stopOpacity('1'),
													_1: {ctor: '[]'}
												}
											}
										},
										{ctor: '[]'}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$svg$Svg$stop,
											{
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$offset('0.499'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$stopColor('#fff'),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$stopOpacity('0'),
														_1: {ctor: '[]'}
													}
												}
											},
											{ctor: '[]'}),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$svg$Svg$stop,
												{
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$offset('0.5'),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$stopColor('#000'),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$stopOpacity('0'),
															_1: {ctor: '[]'}
														}
													}
												},
												{ctor: '[]'}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$svg$Svg$stop,
													{
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$offset('1'),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$stopColor('#000'),
															_1: {
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$stopOpacity('1'),
																_1: {ctor: '[]'}
															}
														}
													},
													{ctor: '[]'}),
												_1: {ctor: '[]'}
											}
										}
									}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$rect,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$id('picker'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$width('200'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$height('150'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill(colHex),
										_1: {ctor: '[]'}
									}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$rect,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$width('200'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$height('150'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('url(#pickerSaturation)'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$rect,
								A2(
									_elm_lang$core$Basics_ops['++'],
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$width('200'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$height('150'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$fill('url(#pickerBrightness)'),
												_1: {ctor: '[]'}
											}
										}
									},
									A3(_simonh1000$elm_colorpicker$ColorPicker$dragAttrs, model.pickerMouseDown, _simonh1000$elm_colorpicker$ColorPicker$PickerMouseDown, _simonh1000$elm_colorpicker$ColorPicker$PickerClick)),
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});
var _simonh1000$elm_colorpicker$ColorPicker$view = F2(
	function (col, _p15) {
		var _p16 = _p15;
		var _p17 = _p16._0;
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$id('color-picker'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'background-color', _1: 'white'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'padding', _1: '2px'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'display', _1: 'inline-block'},
									_1: {ctor: '[]'}
								}
							}
						}),
					_1: {
						ctor: '::',
						_0: _simonh1000$elm_colorpicker$ColorPicker$bubblePreventer,
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _simonh1000$elm_colorpicker$ColorPicker$pickerStyles,
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(_simonh1000$elm_colorpicker$ColorPicker$picker, col, _p17),
						_1: {
							ctor: '::',
							_0: A2(_simonh1000$elm_colorpicker$ColorPicker$pickerIndicator, _p17.lastHue, col),
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _simonh1000$elm_colorpicker$ColorPicker$pickerStyles,
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _simonh1000$elm_colorpicker$ColorPicker$slider(_p17),
							_1: {
								ctor: '::',
								_0: A2(_simonh1000$elm_colorpicker$ColorPicker$sliderIndicator, _p17.lastHue, col),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}
			});
	});

var _user$project$Util$toRgbaString = function (color) {
	var _p0 = _elm_lang$core$Color$toRgb(color);
	var red = _p0.red;
	var green = _p0.green;
	var blue = _p0.blue;
	var alpha = _p0.alpha;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		'rgba(',
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(red),
			A2(
				_elm_lang$core$Basics_ops['++'],
				',',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(green),
					A2(
						_elm_lang$core$Basics_ops['++'],
						',',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(blue),
							A2(
								_elm_lang$core$Basics_ops['++'],
								',',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(alpha),
									')'))))))));
};
var _user$project$Util$secs = function (x) {
	return _elm_lang$core$Time$second * x;
};
var _user$project$Util$minutes = function (_p1) {
	return A2(
		F2(
			function (x, y) {
				return x * y;
			}),
		60,
		A2(
			F2(
				function (x, y) {
					return x * y;
				}),
			_elm_lang$core$Time$second,
			_p1));
};
var _user$project$Util$translate = function (_p2) {
	var _p3 = _p2;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		'translate(',
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(_p3._0),
			A2(
				_elm_lang$core$Basics_ops['++'],
				',',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(_p3._1),
					')'))));
};
var _user$project$Util$timeToString = function (time) {
	var s = A2(
		_mgold$elm_date_format$Time_Format$format,
		'%M:%S',
		_elm_lang$core$Basics$abs(time));
	return (_elm_lang$core$Native_Utils.cmp(time, 0) < 0) ? A2(_elm_lang$core$Basics_ops['++'], '-', s) : s;
};
var _user$project$Util$wh = function (model) {
	return {
		ctor: '_Tuple2',
		_0: _elm_lang$core$Basics$toFloat(model.size.width),
		_1: _elm_lang$core$Basics$toFloat(model.size.height)
	};
};

var _user$project$Data$defaultColor = A3(_elm_lang$core$Color$rgb, 0, 177, 0);
var _user$project$Data$defaultConfig = {
	duration: _user$project$Util$minutes(25),
	overtime: _user$project$Util$minutes(10),
	challenge: 20 * _elm_lang$core$Time$second,
	textColor: _user$project$Data$defaultColor,
	sound: true
};
var _user$project$Data$colorDecoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'a',
	_elm_lang$core$Json_Decode$float,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'b',
		_elm_lang$core$Json_Decode$int,
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'g',
			_elm_lang$core$Json_Decode$int,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
				'r',
				_elm_lang$core$Json_Decode$int,
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_elm_lang$core$Color$rgba)))));
var _user$project$Data$encodeColor = function (color) {
	var _p0 = _elm_lang$core$Color$toRgb(color);
	var red = _p0.red;
	var green = _p0.green;
	var blue = _p0.blue;
	var alpha = _p0.alpha;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: A2(
				F2(
					function (v0, v1) {
						return {ctor: '_Tuple2', _0: v0, _1: v1};
					}),
				'r',
				_elm_lang$core$Json_Encode$int(red)),
			_1: {
				ctor: '::',
				_0: A2(
					F2(
						function (v0, v1) {
							return {ctor: '_Tuple2', _0: v0, _1: v1};
						}),
					'g',
					_elm_lang$core$Json_Encode$int(green)),
				_1: {
					ctor: '::',
					_0: A2(
						F2(
							function (v0, v1) {
								return {ctor: '_Tuple2', _0: v0, _1: v1};
							}),
						'b',
						_elm_lang$core$Json_Encode$int(blue)),
					_1: {
						ctor: '::',
						_0: A2(
							F2(
								function (v0, v1) {
									return {ctor: '_Tuple2', _0: v0, _1: v1};
								}),
							'a',
							_elm_lang$core$Json_Encode$float(alpha)),
						_1: {ctor: '[]'}
					}
				}
			}
		});
};
var _user$project$Data$encodeConfig = function (config) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: A2(
				F2(
					function (v0, v1) {
						return {ctor: '_Tuple2', _0: v0, _1: v1};
					}),
				'duration',
				_elm_lang$core$Json_Encode$float(config.duration)),
			_1: {
				ctor: '::',
				_0: A2(
					F2(
						function (v0, v1) {
							return {ctor: '_Tuple2', _0: v0, _1: v1};
						}),
					'overtime',
					_elm_lang$core$Json_Encode$float(config.overtime)),
				_1: {
					ctor: '::',
					_0: A2(
						F2(
							function (v0, v1) {
								return {ctor: '_Tuple2', _0: v0, _1: v1};
							}),
						'challenge',
						_elm_lang$core$Json_Encode$float(config.challenge)),
					_1: {
						ctor: '::',
						_0: A2(
							F2(
								function (v0, v1) {
									return {ctor: '_Tuple2', _0: v0, _1: v1};
								}),
							'color',
							_user$project$Data$encodeColor(config.textColor)),
						_1: {
							ctor: '::',
							_0: A2(
								F2(
									function (v0, v1) {
										return {ctor: '_Tuple2', _0: v0, _1: v1};
									}),
								'sound',
								_elm_lang$core$Json_Encode$bool(config.sound)),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		});
};
var _user$project$Data$TimerConfig = F5(
	function (a, b, c, d, e) {
		return {duration: a, overtime: b, challenge: c, textColor: d, sound: e};
	});
var _user$project$Data$configDecoder = _elm_lang$core$Json_Decode$oneOf(
	{
		ctor: '::',
		_0: _elm_lang$core$Json_Decode$null(_user$project$Data$defaultConfig),
		_1: {
			ctor: '::',
			_0: A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
				'sound',
				_elm_lang$core$Json_Decode$bool,
				A4(
					_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional,
					'color',
					_user$project$Data$colorDecoder,
					_user$project$Data$defaultColor,
					A3(
						_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
						'challenge',
						_elm_lang$core$Json_Decode$float,
						A3(
							_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
							'overtime',
							_elm_lang$core$Json_Decode$float,
							A3(
								_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
								'duration',
								_elm_lang$core$Json_Decode$float,
								_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Data$TimerConfig)))))),
			_1: {ctor: '[]'}
		}
	});

var _user$project$Ports$playAudio = _elm_lang$core$Native_Platform.outgoingPort(
	'playAudio',
	function (v) {
		return v;
	});
var _user$project$Ports$storeConfig = _elm_lang$core$Native_Platform.outgoingPort(
	'storeConfig',
	function (v) {
		return v;
	});

var _zwilias$elm_touch_events$Touch$addToTrail = F2(
	function (coordinate, _p0) {
		var _p1 = _p0;
		return {
			from: _p1.from,
			through: {ctor: '::', _0: _p1.to, _1: _p1.through},
			to: coordinate
		};
	});
var _zwilias$elm_touch_events$Touch$locate = function (_p2) {
	var _p3 = _p2;
	return _p3._1;
};
var _zwilias$elm_touch_events$Touch$isSwipeType = F2(
	function (delta, predicate) {
		return function (_p4) {
			return A2(
				_elm_lang$core$Maybe$withDefault,
				false,
				A2(
					_elm_lang$core$Maybe$map,
					predicate,
					delta(_p4)));
		};
	});
var _zwilias$elm_touch_events$Touch$deltaY = function (gesture) {
	var _p5 = gesture;
	if (_p5.ctor === 'EndGesture') {
		return _elm_lang$core$Maybe$Just(_p5._0.to.y - _p5._0.from.y);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _zwilias$elm_touch_events$Touch$isDownSwipe = function (sensitivity) {
	return A2(
		_zwilias$elm_touch_events$Touch$isSwipeType,
		_zwilias$elm_touch_events$Touch$deltaY,
		function (dY) {
			return _elm_lang$core$Native_Utils.cmp(dY, sensitivity) > -1;
		});
};
var _zwilias$elm_touch_events$Touch$isUpSwipe = function (sensitivity) {
	return A2(
		_zwilias$elm_touch_events$Touch$isSwipeType,
		_zwilias$elm_touch_events$Touch$deltaY,
		function (dY) {
			return _elm_lang$core$Native_Utils.cmp(dY, 0 - sensitivity) < 1;
		});
};
var _zwilias$elm_touch_events$Touch$deltaX = function (gesture) {
	var _p6 = gesture;
	if (_p6.ctor === 'EndGesture') {
		return _elm_lang$core$Maybe$Just(_p6._0.to.x - _p6._0.from.x);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _zwilias$elm_touch_events$Touch$isRightSwipe = function (sensitivity) {
	return A2(
		_zwilias$elm_touch_events$Touch$isSwipeType,
		_zwilias$elm_touch_events$Touch$deltaX,
		function (dX) {
			return _elm_lang$core$Native_Utils.cmp(dX, sensitivity) > -1;
		});
};
var _zwilias$elm_touch_events$Touch$isLeftSwipe = function (sensitivity) {
	return A2(
		_zwilias$elm_touch_events$Touch$isSwipeType,
		_zwilias$elm_touch_events$Touch$deltaX,
		function (dX) {
			return _elm_lang$core$Native_Utils.cmp(dX, 0 - sensitivity) < 1;
		});
};
var _zwilias$elm_touch_events$Touch$isTap = function (gesture) {
	var _p7 = gesture;
	if (_p7.ctor === 'EndTap') {
		return true;
	} else {
		return false;
	}
};
var _zwilias$elm_touch_events$Touch$Position = F2(
	function (a, b) {
		return {x: a, y: b};
	});
var _zwilias$elm_touch_events$Touch$decodeTouch = F2(
	function (fieldName, tagger) {
		return A2(
			_elm_lang$core$Json_Decode$map,
			tagger,
			A2(
				_elm_lang$core$Json_Decode$at,
				{
					ctor: '::',
					_0: fieldName,
					_1: {
						ctor: '::',
						_0: '0',
						_1: {ctor: '[]'}
					}
				},
				A3(
					_elm_lang$core$Json_Decode$map2,
					_zwilias$elm_touch_events$Touch$Position,
					A2(_elm_lang$core$Json_Decode$field, 'clientX', _elm_lang$core$Json_Decode$float),
					A2(_elm_lang$core$Json_Decode$field, 'clientY', _elm_lang$core$Json_Decode$float))));
	});
var _zwilias$elm_touch_events$Touch$Trail = F3(
	function (a, b, c) {
		return {from: a, through: b, to: c};
	});
var _zwilias$elm_touch_events$Touch$EndTap = function (a) {
	return {ctor: 'EndTap', _0: a};
};
var _zwilias$elm_touch_events$Touch$EndGesture = function (a) {
	return {ctor: 'EndGesture', _0: a};
};
var _zwilias$elm_touch_events$Touch$Moved = function (a) {
	return {ctor: 'Moved', _0: a};
};
var _zwilias$elm_touch_events$Touch$Started = function (a) {
	return {ctor: 'Started', _0: a};
};
var _zwilias$elm_touch_events$Touch$record = F2(
	function (_p8, gesture) {
		var _p9 = _p8;
		var _p11 = _p9._1;
		var _p10 = {ctor: '_Tuple2', _0: _p9._0, _1: gesture};
		switch (_p10._0.ctor) {
			case 'Start':
				return _zwilias$elm_touch_events$Touch$Started(_p11);
			case 'Move':
				switch (_p10._1.ctor) {
					case 'Started':
						return _zwilias$elm_touch_events$Touch$Moved(
							{
								from: _p10._1._0,
								through: {ctor: '[]'},
								to: _p11
							});
					case 'Moved':
						return _zwilias$elm_touch_events$Touch$Moved(
							A2(_zwilias$elm_touch_events$Touch$addToTrail, _p11, _p10._1._0));
					default:
						return _zwilias$elm_touch_events$Touch$Started(_p11);
				}
			default:
				if (_p10._1.ctor === 'Moved') {
					return _zwilias$elm_touch_events$Touch$EndGesture(
						A2(_zwilias$elm_touch_events$Touch$addToTrail, _p11, _p10._1._0));
				} else {
					return _zwilias$elm_touch_events$Touch$EndTap(_p11);
				}
		}
	});
var _zwilias$elm_touch_events$Touch$None = {ctor: 'None'};
var _zwilias$elm_touch_events$Touch$blanco = _zwilias$elm_touch_events$Touch$None;
var _zwilias$elm_touch_events$Touch$Touch = F2(
	function (a, b) {
		return {ctor: 'Touch', _0: a, _1: b};
	});
var _zwilias$elm_touch_events$Touch$End = {ctor: 'End'};
var _zwilias$elm_touch_events$Touch$onEnd = function (tagger) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'touchend',
		{stopPropagation: false, preventDefault: true},
		A2(
			_zwilias$elm_touch_events$Touch$decodeTouch,
			'changedTouches',
			function (_p12) {
				return tagger(
					A2(_zwilias$elm_touch_events$Touch$Touch, _zwilias$elm_touch_events$Touch$End, _p12));
			}));
};
var _zwilias$elm_touch_events$Touch$Move = {ctor: 'Move'};
var _zwilias$elm_touch_events$Touch$onMove = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'touchmove',
		A2(
			_zwilias$elm_touch_events$Touch$decodeTouch,
			'changedTouches',
			function (_p13) {
				return tagger(
					A2(_zwilias$elm_touch_events$Touch$Touch, _zwilias$elm_touch_events$Touch$Move, _p13));
			}));
};
var _zwilias$elm_touch_events$Touch$Start = {ctor: 'Start'};
var _zwilias$elm_touch_events$Touch$onStart = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'touchstart',
		A2(
			_zwilias$elm_touch_events$Touch$decodeTouch,
			'touches',
			function (_p14) {
				return tagger(
					A2(_zwilias$elm_touch_events$Touch$Touch, _zwilias$elm_touch_events$Touch$Start, _p14));
			}));
};

var _user$project$Types$Timer = F2(
	function (a, b) {
		return {player: a, time: b};
	});
var _user$project$Types$Model = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return {playerOne: a, playerTwo: b, player: c, mode: d, config: e, size: f, challenge: g, resetGesture: h, resetButtonPos: i, colorPicker: j};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _user$project$Types$GameOver = function (a) {
	return {ctor: 'GameOver', _0: a};
};
var _user$project$Types$Settings = {ctor: 'Settings'};
var _user$project$Types$Pause = {ctor: 'Pause'};
var _user$project$Types$Tick = {ctor: 'Tick'};
var _user$project$Types$Stopped = function (a) {
	return {ctor: 'Stopped', _0: a};
};
var _user$project$Types$PlayerTwo = {ctor: 'PlayerTwo'};
var _user$project$Types$PlayerOne = {ctor: 'PlayerOne'};
var _user$project$Types$None = {ctor: 'None'};
var _user$project$Types$Challenge = function (a) {
	return {ctor: 'Challenge', _0: a};
};
var _user$project$Types$Overtime = function (a) {
	return {ctor: 'Overtime', _0: a};
};
var _user$project$Types$Duration = function (a) {
	return {ctor: 'Duration', _0: a};
};
var _user$project$Types$Sound = {ctor: 'Sound'};
var _user$project$Types$TimeSetting = function (a) {
	return {ctor: 'TimeSetting', _0: a};
};
var _user$project$Types$ColorPickerMsg = function (a) {
	return {ctor: 'ColorPickerMsg', _0: a};
};
var _user$project$Types$SaveSettings = {ctor: 'SaveSettings'};
var _user$project$Types$SoundSettingChanged = {ctor: 'SoundSettingChanged'};
var _user$project$Types$TimeSettingChanged = function (a) {
	return {ctor: 'TimeSettingChanged', _0: a};
};
var _user$project$Types$ShowSettings = function (a) {
	return {ctor: 'ShowSettings', _0: a};
};
var _user$project$Types$SizeChanged = function (a) {
	return {ctor: 'SizeChanged', _0: a};
};
var _user$project$Types$TickSecond = function (a) {
	return {ctor: 'TickSecond', _0: a};
};
var _user$project$Types$ResetSwipeEnd = function (a) {
	return {ctor: 'ResetSwipeEnd', _0: a};
};
var _user$project$Types$ResetSwipe = function (a) {
	return {ctor: 'ResetSwipe', _0: a};
};
var _user$project$Types$Toggle = {ctor: 'Toggle'};
var _user$project$Types$Tapped = function (a) {
	return {ctor: 'Tapped', _0: a};
};

var _user$project$View_Countdown$timeLeft = F3(
	function (rot, off, time) {
		return A2(
			_elm_lang$svg$Svg$text_,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$class(
						A2(
							_elm_lang$core$Basics_ops['++'],
							'time-left',
							off ? ' off' : '')),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fontSize('14'),
						_1: {ctor: '[]'}
					}
				},
				rot ? {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$transform('rotate(180)'),
					_1: {ctor: '[]'}
				} : {ctor: '[]'}),
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg$text(
					_user$project$Util$timeToString(time)),
				_1: {ctor: '[]'}
			});
	});
var _user$project$View_Countdown$view = F3(
	function (rot, remaining, model) {
		var outer = A2(
			_folkertdev$one_true_path_experiment$Curve$radial,
			{ctor: '_Tuple2', _0: 0, _1: 0},
			A2(
				_elm_lang$core$List$map,
				function (i) {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Basics$toFloat(i),
						_1: 30
					};
				},
				A2(_elm_lang$core$List$range, 0, 360)));
		var inner = A2(
			_folkertdev$one_true_path_experiment$Curve$radial,
			{ctor: '_Tuple2', _0: 0, _1: 0},
			A2(
				_elm_lang$core$List$map,
				function (i) {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Basics$toFloat(i),
						_1: 20
					};
				},
				A2(_elm_lang$core$List$range, 0, 360)));
		var dx = remaining / model.config.challenge;
		var ps = A2(
			_elm_lang$core$List$map,
			function (i) {
				var fi = _elm_lang$core$Basics$toFloat(i);
				var dy = fi / 360;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Basics$degrees(fi),
					_1: (_elm_lang$core$Native_Utils.cmp(dy, dx) < 0) ? 25 : 0
				};
			},
			A2(_elm_lang$core$List$range, 0, 360));
		var aps = A2(
			_elm_lang$core$List$map,
			function (_p0) {
				var _p1 = _p0;
				return {
					ctor: '_Tuple2',
					_0: _p1._0,
					_1: _elm_lang$core$Native_Utils.eq(_p1._1, 25) ? 0 : 25
				};
			},
			ps);
		var sub2 = A2(
			_folkertdev$one_true_path_experiment$Curve$radial,
			{ctor: '_Tuple2', _0: 0, _1: 0},
			aps);
		var sub = A2(
			_folkertdev$one_true_path_experiment$Curve$radial,
			{ctor: '_Tuple2', _0: 0, _1: 0},
			ps);
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$transform(
					A2(
						_elm_lang$core$Basics_ops['++'],
						_user$project$Util$translate(
							{
								ctor: '_Tuple2',
								_0: _elm_lang$core$Basics$toFloat(model.size.width) / 2,
								_1: _elm_lang$core$Basics$toFloat(model.size.height) / 2
							}),
						' scale(1.5)')),
				_1: {
					ctor: '::',
					_0: _zwilias$elm_touch_events$Touch$onStart(
						function (event) {
							return _user$project$Types$Toggle;
						}),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_folkertdev$one_true_path_experiment$SubPath$element,
					sub,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$class('pie'),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_folkertdev$one_true_path_experiment$SubPath$element,
						sub2,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(
								_user$project$Util$toRgbaString(model.config.textColor)),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_folkertdev$one_true_path_experiment$SubPath$element,
							inner,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$class(
									A2(
										_elm_lang$core$Basics_ops['++'],
										'inner',
										_elm_lang$core$Native_Utils.eq(
											model.mode,
											_user$project$Types$Stopped(_user$project$Types$Pause)) ? ' off' : ' on')),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A3(
								_user$project$View_Countdown$timeLeft,
								rot,
								_elm_lang$core$Native_Utils.eq(
									model.mode,
									_user$project$Types$Stopped(_user$project$Types$Pause)),
								remaining),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});

var _user$project$View_PauseButton$bar = F4(
	function (stopped, secsPerc, _p1, _p0) {
		var _p2 = _p1;
		var _p3 = _p0;
		var _p5 = _p3._0;
		var _p4 = _p3._1;
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$transform(
					_user$project$Util$translate(
						{ctor: '_Tuple2', _0: _p2._0, _1: _p2._1})),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$rect,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$x(
							_elm_lang$core$Basics$toString((0 - _p5) / 2)),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$y(
								_elm_lang$core$Basics$toString((0 - _p4) / 2)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$width(
									_elm_lang$core$Basics$toString(_p5)),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$height(
										_elm_lang$core$Basics$toString(_p4)),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('grey'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$stroke('black'),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$rect,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$x(
								_elm_lang$core$Basics$toString((0 - _p5) / 2)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$y(
									_elm_lang$core$Basics$toString((0 - _p4) / 2)),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$width(
										_elm_lang$core$Basics$toString(_p5)),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$height(
											_elm_lang$core$Basics$toString(_p4 * secsPerc)),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$fill(
												stopped ? 'red' : 'orange'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$stroke('none'),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$View_PauseButton$pause = F4(
	function (_p6, stopped, challengeSecs, secsLeft) {
		var _p7 = _p6;
		var c2 = '#006600';
		var c1 = '#434343';
		var box = function (x) {
			return _folkertdev$one_true_path_experiment$Curve$linear(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: x, _1: -16},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: x, _1: 16},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: x + (16 / 3), _1: 16},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: x + (16 / 3), _1: -16},
								_1: {ctor: '[]'}
							}
						}
					}
				});
		};
		var tri = _folkertdev$one_true_path_experiment$Curve$linear(
			{
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: -16, _1: -16},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: -16, _1: 16},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 0, _1: 0},
						_1: {ctor: '[]'}
					}
				}
			});
		return A2(
			_elm_lang$svg$Svg$g,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_folkertdev$one_true_path_experiment$SubPath$element,
					tri,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fill(
							(!stopped) ? c2 : c1),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_folkertdev$one_true_path_experiment$SubPath$element,
						box(0),
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(
								stopped ? c2 : c1),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_folkertdev$one_true_path_experiment$SubPath$element,
							box((2 * 16) / 3),
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(
									stopped ? c2 : c1),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _user$project$View_PauseButton$view = function (model) {
	var _p8 = {ctor: '_Tuple2', _0: 32, _1: 32};
	var w = _p8._0;
	var h = _p8._1;
	return A2(
		_elm_lang$svg$Svg$g,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$transform(
				_user$project$Util$translate(
					{
						ctor: '_Tuple2',
						_0: _elm_lang$core$Basics$toFloat(model.size.width) / 2,
						_1: _elm_lang$core$Basics$toFloat(model.size.height) / 2
					})),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A4(
				_user$project$View_PauseButton$pause,
				{ctor: '_Tuple2', _0: w, _1: h},
				_elm_lang$core$Native_Utils.eq(
					model.mode,
					_user$project$Types$Stopped(_user$project$Types$Pause)),
				model.config.challenge,
				A2(_elm_lang$core$Maybe$withDefault, 0, model.challenge)),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$rect,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$x(
							_elm_lang$core$Basics$toString((0 - w) / 2)),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$y(
								_elm_lang$core$Basics$toString((0 - h) / 2)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$width(
									_elm_lang$core$Basics$toString(w)),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$height(
										_elm_lang$core$Basics$toString(h)),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
										_1: {
											ctor: '::',
											_0: _zwilias$elm_touch_events$Touch$onStart(
												function (event) {
													return _user$project$Types$Toggle;
												}),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			}
		});
};

var _user$project$View_ResetButton$resetButtonPos = function (model) {
	var _p0 = _user$project$Util$wh(model);
	var w = _p0._0;
	var h = _p0._1;
	var _p1 = {ctor: '_Tuple2', _0: w / 10, _1: h / 2};
	var dpX = _p1._0;
	var dpY = _p1._1;
	return _elm_lang$core$Native_Utils.eq(model.resetGesture, _zwilias$elm_touch_events$Touch$blanco) ? {ctor: '_Tuple2', _0: dpX, _1: dpY} : model.resetButtonPos;
};
var _user$project$View_ResetButton$view = function (model) {
	var _p2 = {ctor: '_Tuple2', _0: 36, _1: 36};
	var w = _p2._0;
	var h = _p2._1;
	var pos = _user$project$View_ResetButton$resetButtonPos(model);
	return A2(
		_elm_lang$svg$Svg$g,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$transform(
				_user$project$Util$translate(pos)),
			_1: {ctor: '[]'}
		},
		(!_elm_lang$core$Native_Utils.eq(model.mode, _user$project$Types$Tick)) ? {
			ctor: '::',
			_0: A2(
				_elm_lang$svg$Svg$image,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$x(
						_elm_lang$core$Basics$toString((0 - w) / 2)),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$y(
							_elm_lang$core$Basics$toString((0 - h) / 2)),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$width(
								_elm_lang$core$Basics$toString(w)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$height(
									_elm_lang$core$Basics$toString(h)),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$xlinkHref('img/restart.svg'),
									_1: {
										ctor: '::',
										_0: _zwilias$elm_touch_events$Touch$onStart(_user$project$Types$ResetSwipe),
										_1: {
											ctor: '::',
											_0: _zwilias$elm_touch_events$Touch$onMove(_user$project$Types$ResetSwipe),
											_1: {
												ctor: '::',
												_0: _zwilias$elm_touch_events$Touch$onEnd(_user$project$Types$ResetSwipeEnd),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				},
				{ctor: '[]'}),
			_1: {ctor: '[]'}
		} : {ctor: '[]'});
};

var _user$project$View_Timer$tapRect = F4(
	function (isActive, _p0, model, player) {
		var _p1 = _p0;
		var backgroundColor = function () {
			var _p2 = model.mode;
			if (_p2.ctor === 'Stopped') {
				var _p3 = _p2._0;
				if (_p3.ctor === 'GameOver') {
					return _elm_lang$core$Native_Utils.eq(_p3._0, player) ? 'red' : 'green';
				} else {
					return 'transparent';
				}
			} else {
				return 'transparent';
			}
		}();
		var _p4 = {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Basics$toFloat(model.size.width),
			_1: _elm_lang$core$Basics$toFloat(model.size.height) / 2
		};
		var w = _p4._0;
		var h = _p4._1;
		return A2(
			_elm_lang$svg$Svg$rect,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$x(
						_elm_lang$core$Basics$toString((0 - w) / 2)),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$y(
							_elm_lang$core$Basics$toString((0 - h) / 2)),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$width(
								_elm_lang$core$Basics$toString(w)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$height(
									_elm_lang$core$Basics$toString(h)),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(
										isActive ? 'black' : 'none'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$strokeWidth('1'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$fill(backgroundColor),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$opacity('0.1'),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				},
				isActive ? {
					ctor: '::',
					_0: _zwilias$elm_touch_events$Touch$onStart(
						function (event) {
							return _user$project$Types$Tapped(player);
						}),
					_1: {ctor: '[]'}
				} : {ctor: '[]'}),
			{ctor: '[]'});
	});
var _user$project$View_Timer$view = F4(
	function (rot, pos, model, timer) {
		var isActive = function () {
			var _p5 = model.mode;
			if (_p5.ctor === 'Stopped') {
				var _p6 = _p5._0;
				if (_p6.ctor === 'Pause') {
					return true;
				} else {
					return false;
				}
			} else {
				return _elm_lang$core$Native_Utils.eq(timer.player, model.player) || _elm_lang$core$Native_Utils.eq(model.player, _user$project$Types$None);
			}
		}();
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$transform(
					A2(
						_elm_lang$core$Basics_ops['++'],
						_user$project$Util$translate(pos),
						A2(
							_elm_lang$core$Basics_ops['++'],
							' rotate(',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(rot),
								')')))),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$text_,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$textAnchor('middle'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fontSize('120'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fontWeight('bold'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$dominantBaseline('middle'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$stroke('black'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$strokeWidth('2'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$fill(
													_user$project$Util$toRgbaString(model.config.textColor)),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$opacity(
														isActive ? '1' : '0.5'),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg$text(
							_user$project$Util$timeToString(timer.time)),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A4(_user$project$View_Timer$tapRect, isActive, pos, model, timer.player),
					_1: {ctor: '[]'}
				}
			});
	});

var _user$project$View_Game$viewSettingsButton = F2(
	function (pos, model) {
		var _p0 = {ctor: '_Tuple2', _0: 36, _1: 36};
		var w = _p0._0;
		var h = _p0._1;
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$transform(
					_user$project$Util$translate(pos)),
				_1: {ctor: '[]'}
			},
			(!_elm_lang$core$Native_Utils.eq(model.mode, _user$project$Types$Tick)) ? {
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$image,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$x(
							_elm_lang$core$Basics$toString((0 - w) / 2)),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$y(
								_elm_lang$core$Basics$toString((0 - h) / 2)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$width(
									_elm_lang$core$Basics$toString(w)),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$height(
										_elm_lang$core$Basics$toString(h)),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$xlinkHref('img/settings.svg'),
										_1: {
											ctor: '::',
											_0: _zwilias$elm_touch_events$Touch$onEnd(_user$project$Types$ShowSettings),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			} : {ctor: '[]'});
	});
var _user$project$View_Game$view = function (model) {
	var _p1 = _user$project$Util$wh(model);
	var w = _p1._0;
	var h = _p1._1;
	var posOne = {ctor: '_Tuple2', _0: w / 2, _1: h / 6};
	var posTwo = {ctor: '_Tuple2', _0: w / 2, _1: (5 * h) / 6};
	return A2(
		_elm_lang$svg$Svg$svg,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$viewBox(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'0 0 ',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(w),
						A2(
							_elm_lang$core$Basics_ops['++'],
							' ',
							_elm_lang$core$Basics$toString(h))))),
			_1: {ctor: '[]'}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			{
				ctor: '::',
				_0: A4(_user$project$View_Timer$view, 180, posOne, model, model.playerOne),
				_1: {
					ctor: '::',
					_0: A4(_user$project$View_Timer$view, 0, posTwo, model, model.playerTwo),
					_1: {
						ctor: '::',
						_0: _user$project$View_ResetButton$view(model),
						_1: {
							ctor: '::',
							_0: A2(
								_user$project$View_Game$viewSettingsButton,
								{ctor: '_Tuple2', _0: (9 * w) / 10, _1: h / 2},
								model),
							_1: {ctor: '[]'}
						}
					}
				}
			},
			function () {
				var _p2 = model.challenge;
				if (_p2.ctor === 'Nothing') {
					return ((!_elm_lang$core$Native_Utils.eq(model.player, _user$project$Types$None)) && (_elm_lang$core$Native_Utils.eq(model.mode, _user$project$Types$Tick) || _elm_lang$core$Native_Utils.eq(
						model.mode,
						_user$project$Types$Stopped(_user$project$Types$Pause)))) ? {
						ctor: '::',
						_0: _user$project$View_PauseButton$view(model),
						_1: {ctor: '[]'}
					} : {ctor: '[]'};
				} else {
					var rot = _elm_lang$core$Native_Utils.eq(model.player, _user$project$Types$PlayerOne);
					return {
						ctor: '::',
						_0: A3(_user$project$View_Countdown$view, rot, _p2._0, model),
						_1: {ctor: '[]'}
					};
				}
			}()));
};

var _user$project$View_Settings$myRadioButtonGroup = F3(
	function (setting, value, times) {
		return A2(
			_rundis$elm_bootstrap$Bootstrap_ButtonGroup$radioButtonGroup,
			{
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_ButtonGroup$small,
				_1: {ctor: '[]'}
			},
			A2(
				_elm_lang$core$List$map,
				function (s) {
					return A3(
						_rundis$elm_bootstrap$Bootstrap_ButtonGroup$radioButton,
						_elm_lang$core$Native_Utils.eq(value, s),
						{
							ctor: '::',
							_0: _elm_lang$core$Native_Utils.eq(value, s) ? _rundis$elm_bootstrap$Bootstrap_Button$success : _rundis$elm_bootstrap$Bootstrap_Button$secondary,
							_1: {
								ctor: '::',
								_0: _rundis$elm_bootstrap$Bootstrap_Button$small,
								_1: {
									ctor: '::',
									_0: _rundis$elm_bootstrap$Bootstrap_Button$attrs(
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('ml-1'),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(
											_user$project$Types$TimeSettingChanged(
												setting(s))),
										_1: {ctor: '[]'}
									}
								}
							}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text(
								_user$project$Util$timeToString(s)),
							_1: {ctor: '[]'}
						});
				},
				times));
	});
var _user$project$View_Settings$challenges = function (model) {
	return A3(
		_user$project$View_Settings$myRadioButtonGroup,
		_user$project$Types$Challenge,
		model.config.challenge,
		A2(
			_elm_lang$core$List$map,
			_user$project$Util$secs,
			{
				ctor: '::',
				_0: 25,
				_1: {
					ctor: '::',
					_0: 20,
					_1: {
						ctor: '::',
						_0: 15,
						_1: {ctor: '[]'}
					}
				}
			}));
};
var _user$project$View_Settings$overtimes = function (model) {
	return A3(
		_user$project$View_Settings$myRadioButtonGroup,
		_user$project$Types$Overtime,
		model.config.overtime,
		A2(
			_elm_lang$core$List$map,
			_user$project$Util$minutes,
			{
				ctor: '::',
				_0: 15,
				_1: {
					ctor: '::',
					_0: 10,
					_1: {
						ctor: '::',
						_0: 5,
						_1: {ctor: '[]'}
					}
				}
			}));
};
var _user$project$View_Settings$durations = function (model) {
	return A3(
		_user$project$View_Settings$myRadioButtonGroup,
		_user$project$Types$Duration,
		model.config.duration,
		A2(
			_elm_lang$core$List$map,
			_user$project$Util$minutes,
			{
				ctor: '::',
				_0: 30,
				_1: {
					ctor: '::',
					_0: 25,
					_1: {
						ctor: '::',
						_0: 20,
						_1: {ctor: '[]'}
					}
				}
			}));
};
var _user$project$View_Settings$soundCheck = function (model) {
	return A2(
		_rundis$elm_bootstrap$Bootstrap_ButtonGroup$radioButtonGroup,
		{
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_ButtonGroup$small,
			_1: {ctor: '[]'}
		},
		A2(
			_elm_lang$core$List$map,
			function (_p0) {
				var _p1 = _p0;
				var _p2 = _p1._1;
				return A3(
					_rundis$elm_bootstrap$Bootstrap_ButtonGroup$radioButton,
					_elm_lang$core$Native_Utils.eq(_p2, model.config.sound),
					{
						ctor: '::',
						_0: _elm_lang$core$Native_Utils.eq(model.config.sound, _p2) ? _rundis$elm_bootstrap$Bootstrap_Button$success : _rundis$elm_bootstrap$Bootstrap_Button$secondary,
						_1: {
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Button$small,
							_1: {
								ctor: '::',
								_0: _rundis$elm_bootstrap$Bootstrap_Button$attrs(
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('ml-1'),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(_user$project$Types$SoundSettingChanged),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(_p1._0),
						_1: {ctor: '[]'}
					});
			},
			{
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'On', _1: true},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'Off', _1: false},
					_1: {ctor: '[]'}
				}
			}));
};
var _user$project$View_Settings$formRow = F2(
	function (label, content) {
		return A2(
			_rundis$elm_bootstrap$Bootstrap_Form$row,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_rundis$elm_bootstrap$Bootstrap_Form$colLabel,
					{
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm2,
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$h6,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text(label),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_rundis$elm_bootstrap$Bootstrap_Form$col,
						{
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm10,
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: content,
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$View_Settings$saveButton = A2(
	_rundis$elm_bootstrap$Bootstrap_Button$button,
	{
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(_user$project$Types$SaveSettings),
		_1: {
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Button$small,
			_1: {
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Button$secondary,
				_1: {ctor: '[]'}
			}
		}
	},
	{
		ctor: '::',
		_0: _elm_lang$html$Html$text('Save and return'),
		_1: {ctor: '[]'}
	});
var _user$project$View_Settings$textColor = function (model) {
	return A2(
		_elm_lang$html$Html$map,
		_user$project$Types$ColorPickerMsg,
		A2(_simonh1000$elm_colorpicker$ColorPicker$view, model.config.textColor, model.colorPicker));
};
var _user$project$View_Settings$view = function (model) {
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Grid$containerFluid,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('settings'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_rundis$elm_bootstrap$Bootstrap_Form$form,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_user$project$View_Settings$formRow,
						'Play time',
						_user$project$View_Settings$durations(model)),
					_1: {
						ctor: '::',
						_0: A2(
							_user$project$View_Settings$formRow,
							'Overtime',
							_user$project$View_Settings$overtimes(model)),
						_1: {
							ctor: '::',
							_0: A2(
								_user$project$View_Settings$formRow,
								'Challenge time',
								_user$project$View_Settings$challenges(model)),
							_1: {
								ctor: '::',
								_0: A2(
									_user$project$View_Settings$formRow,
									'Accent Color',
									_user$project$View_Settings$textColor(model)),
								_1: {
									ctor: '::',
									_0: A2(
										_user$project$View_Settings$formRow,
										'Audio effects',
										_user$project$View_Settings$soundCheck(model)),
									_1: {
										ctor: '::',
										_0: A2(_user$project$View_Settings$formRow, ' ', _user$project$View_Settings$saveButton),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		});
};

var _user$project$Main$getCoord = function (ev) {
	return _zwilias$elm_touch_events$Touch$locate(ev);
};
var _user$project$Main$checkChallenge = function (t) {
	return (_elm_lang$core$Native_Utils.cmp(t, 0) < 1) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(t);
};
var _user$project$Main$decTime = function (t) {
	return t - _elm_lang$core$Time$second;
};
var _user$project$Main$decrement = function (timer) {
	return _elm_lang$core$Native_Utils.update(
		timer,
		{
			time: _user$project$Main$decTime(timer.time)
		});
};
var _user$project$Main$view = function (model) {
	var _p0 = model.mode;
	if (_p0.ctor === 'Stopped') {
		var _p1 = _p0._0;
		if (_p1.ctor === 'Settings') {
			return _user$project$View_Settings$view(model);
		} else {
			return _user$project$View_Game$view(model);
		}
	} else {
		return _user$project$View_Game$view(model);
	}
};
var _user$project$Main$subscriptions = function (model) {
	return _elm_lang$core$Native_Utils.eq(model.mode, _user$project$Types$Tick) ? A2(_elm_lang$core$Time$every, _elm_lang$core$Time$second, _user$project$Types$TickSecond) : _elm_lang$core$Platform_Sub$none;
};
var _user$project$Main$initPlayer = F2(
	function (config, player) {
		return {player: player, time: config.duration};
	});
var _user$project$Main$init = function (config) {
	return {
		ctor: '_Tuple2',
		_0: {
			playerOne: A2(_user$project$Main$initPlayer, config, _user$project$Types$PlayerOne),
			playerTwo: A2(_user$project$Main$initPlayer, config, _user$project$Types$PlayerTwo),
			player: _user$project$Types$None,
			mode: _user$project$Types$Stopped(_user$project$Types$Pause),
			config: config,
			size: {width: 0, height: 0},
			challenge: _elm_lang$core$Maybe$Nothing,
			resetGesture: _zwilias$elm_touch_events$Touch$blanco,
			resetButtonPos: {ctor: '_Tuple2', _0: 0, _1: 0},
			colorPicker: _simonh1000$elm_colorpicker$ColorPicker$empty
		},
		_1: A2(_elm_lang$core$Task$perform, _user$project$Types$SizeChanged, _elm_lang$window$Window$size)
	};
};
var _user$project$Main$reset = _user$project$Main$init;
var _user$project$Main$update = F2(
	function (msg, model) {
		var _p2 = msg;
		switch (_p2.ctor) {
			case 'SizeChanged':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{size: _p2._0}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'ShowSettings':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							mode: _user$project$Types$Stopped(_user$project$Types$Settings)
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'SaveSettings':
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{
							mode: _user$project$Types$Stopped(_user$project$Types$Pause)
						}),
					{
						ctor: '::',
						_0: _user$project$Ports$storeConfig(
							_user$project$Data$encodeConfig(model.config)),
						_1: {ctor: '[]'}
					});
			case 'TimeSettingChanged':
				var _p3 = _p2._0;
				switch (_p3.ctor) {
					case 'Duration':
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{
									config: function (c) {
										return _elm_lang$core$Native_Utils.update(
											c,
											{duration: _p3._0});
									}(model.config)
								}),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					case 'Overtime':
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{
									config: function (c) {
										return _elm_lang$core$Native_Utils.update(
											c,
											{overtime: _p3._0});
									}(model.config)
								}),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					default:
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{
									config: function (c) {
										return _elm_lang$core$Native_Utils.update(
											c,
											{challenge: _p3._0});
									}(model.config)
								}),
							_1: _elm_lang$core$Platform_Cmd$none
						};
				}
			case 'ColorPickerMsg':
				var _p4 = A3(_simonh1000$elm_colorpicker$ColorPicker$update, _p2._0, model.config.textColor, model.colorPicker);
				var m = _p4._0;
				var color = _p4._1;
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{
							colorPicker: m,
							config: function (c) {
								return _elm_lang$core$Native_Utils.update(
									c,
									{
										textColor: A2(_elm_lang$core$Maybe$withDefault, c.textColor, color)
									});
							}(model.config)
						}),
					{ctor: '[]'});
			case 'SoundSettingChanged':
				var next = function (c) {
					return _elm_lang$core$Native_Utils.update(
						c,
						{sound: !c.sound});
				}(model.config);
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{config: next}),
					_1: next.sound ? _user$project$Ports$playAudio('snd/resume.mp3') : _elm_lang$core$Platform_Cmd$none
				};
			case 'TickSecond':
				var nextChallenge = A2(
					_elm_lang$core$Maybe$andThen,
					_user$project$Main$checkChallenge,
					A2(_elm_lang$core$Maybe$map, _user$project$Main$decTime, model.challenge));
				var nextModel = function () {
					var _p5 = model.player;
					switch (_p5.ctor) {
						case 'None':
							return model;
						case 'PlayerOne':
							return _elm_lang$core$Native_Utils.update(
								model,
								{
									playerOne: _user$project$Main$decrement(model.playerOne),
									challenge: nextChallenge
								});
						default:
							return _elm_lang$core$Native_Utils.update(
								model,
								{
									playerTwo: _user$project$Main$decrement(model.playerTwo),
									challenge: nextChallenge
								});
					}
				}();
				return (_elm_lang$core$Native_Utils.cmp(nextModel.playerOne.time, 0 - nextModel.config.overtime) < 1) ? A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						nextModel,
						{
							mode: _user$project$Types$Stopped(
								_user$project$Types$GameOver(_user$project$Types$PlayerOne))
						}),
					{ctor: '[]'}) : ((_elm_lang$core$Native_Utils.cmp(nextModel.playerTwo.time, 0 - nextModel.config.overtime) < 1) ? A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						nextModel,
						{
							mode: _user$project$Types$Stopped(
								_user$project$Types$GameOver(_user$project$Types$PlayerTwo))
						}),
					{ctor: '[]'}) : A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					nextModel,
					{ctor: '[]'}));
			case 'ResetSwipe':
				var _p7 = _p2._0;
				var _p6 = _user$project$Main$getCoord(_p7);
				var x = _p6.x;
				var y = _p6.y;
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{
							resetGesture: A2(_zwilias$elm_touch_events$Touch$record, _p7, model.resetGesture),
							resetButtonPos: {
								ctor: '_Tuple2',
								_0: x,
								_1: _elm_lang$core$Basics$toFloat(model.size.height) / 2
							}
						}),
					{ctor: '[]'});
			case 'ResetSwipeEnd':
				var gesture = A2(_zwilias$elm_touch_events$Touch$record, _p2._0, model.resetGesture);
				var complete = A2(
					_zwilias$elm_touch_events$Touch$isRightSwipe,
					_elm_lang$core$Basics$toFloat(model.size.width) * 0.75,
					gesture);
				return (!complete) ? A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{resetGesture: _zwilias$elm_touch_events$Touch$blanco}),
					{ctor: '[]'}) : _user$project$Main$reset(model.config);
			case 'Toggle':
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{
							mode: function () {
								var _p8 = model.mode;
								if (_p8.ctor === 'Stopped') {
									return _user$project$Types$Tick;
								} else {
									return _user$project$Types$Stopped(_user$project$Types$Pause);
								}
							}()
						}),
					{
						ctor: '::',
						_0: function () {
							if (model.config.sound) {
								var _p9 = model.mode;
								if (_p9.ctor === 'Stopped') {
									return _user$project$Ports$playAudio('snd/resume.mp3');
								} else {
									return _user$project$Ports$playAudio('snd/pause.mp3');
								}
							} else {
								return _elm_lang$core$Platform_Cmd$none;
							}
						}(),
						_1: {ctor: '[]'}
					});
			default:
				var _p13 = _p2._0;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							player: function () {
								var _p10 = model.player;
								if (_p10.ctor === 'None') {
									return _elm_lang$core$Native_Utils.eq(_p13, _user$project$Types$PlayerOne) ? _user$project$Types$PlayerTwo : _user$project$Types$PlayerOne;
								} else {
									var _p11 = _p13;
									switch (_p11.ctor) {
										case 'None':
											return _user$project$Types$None;
										case 'PlayerOne':
											return _user$project$Types$PlayerTwo;
										default:
											return _user$project$Types$PlayerOne;
									}
								}
							}(),
							mode: function () {
								var _p12 = model.mode;
								if (_p12.ctor === 'Stopped') {
									return _user$project$Types$Tick;
								} else {
									return model.mode;
								}
							}(),
							challenge: _elm_lang$core$Maybe$Just(model.config.challenge)
						}),
					_1: model.config.sound ? _user$project$Ports$playAudio('snd/click.mp3') : _elm_lang$core$Platform_Cmd$none
				};
		}
	});
var _user$project$Main$initWithFlags = function (val) {
	var _p14 = A2(_elm_lang$core$Json_Decode$decodeValue, _user$project$Data$configDecoder, val);
	if (_p14.ctor === 'Ok') {
		return _user$project$Main$reset(_p14._0);
	} else {
		return _user$project$Main$reset(
			A2(
				_elm_lang$core$Debug$log,
				_elm_lang$core$Basics$toString(_p14._0),
				_user$project$Data$defaultConfig));
	}
};
var _user$project$Main$main = _elm_lang$html$Html$programWithFlags(
	{init: _user$project$Main$initWithFlags, update: _user$project$Main$update, view: _user$project$Main$view, subscriptions: _user$project$Main$subscriptions})(_elm_lang$core$Json_Decode$value);

var Elm = {};
Elm['Main'] = Elm['Main'] || {};
if (typeof _user$project$Main$main !== 'undefined') {
    _user$project$Main$main(Elm['Main'], 'Main', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);

