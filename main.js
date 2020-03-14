


function splitText(str) {
    var arr = str.split(' ');
    var half_len = Math.floor(arr.length / 2)
    var r1 = arr.splice(0, half_len)
    var r2 = arr;
    return {
        r1: r1.join(' '),
        r2: r2.join(' ')
    }
}

var tree_index = 0;

var diameter = 800;

var width = diameter;

var height = diameter;

var duration = 350;



$(function () {

    d3.json("recommend_tree.json", function (error, recommend) {

        d3.csv("movies_info.csv", function (error, movies) {
    
            recommend.forEach(function (parent) {
                parent.children.forEach(function (c) {
                    c.children.forEach(function (gc) {
                        for (i = 0; i < movies.length - 1; i++) {
                            if (gc.MovieID == movies[i].MovieID) {
                                gc.name = movies[i].Title
                            }
                            if (c.MovieID == movies[i].MovieID) {
                                c.name = movies[i].Title
                            }
                        }
                    })
                })
    
                for (i = 0; i < movies.length - 1; i++) {
                    if (parent.MovieID == movies[i].MovieID) {
                        parent.name = movies[i].Title
                    }
                }
            });

            $('.btn').click(function() {
                renderChart()
            })


            renderChart()

            function renderChart() {
                for (var i = 0; i< 5; i++) {
                    if (tree_index + i > recommend.length - 1) {
                        genTree(tree_index + i - recommend.length)
                    } else {
                        genTree(tree_index + i)
                    }
                }
                tree_index += 5;
                if (tree_index > recommend.length - 1) {
                    tree_index = tree_index - recommend.length;
                }
            }
    
    
            function genTree(index) {
                var root = recommend[index]
                root.x0 = height / 2;
                root.y0 = 0;            
                var tree = d3.layout.tree()
                    .size([360, diameter / 2 - 80])
                    .separation(function (a, b) {
                        return (a.parent == b.parent ? 1 : 3) / a.depth;
                    });
                var diagonal = d3.svg.diagonal.radial()
                    .projection(function (d) { return [d.y, d.x / 180 * Math.PI]; });
    
                var relative_index = index % 5  
                $('#tree-' + relative_index).empty()
                var svg = d3.select("#tree-" + relative_index).append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
                scale(relative_index)
    
                collapse(root)
                update(root)
    
                //d3.select(self.frameElement).style("height", "800px");
    
                function update(source) {
    
                    // Compute the new tree layout.
                    var nodes = tree.nodes(root),
                        links = tree.links(nodes);
    
                    // Normalize for fixed-depth.
                    nodes.forEach(function (d) {
                        if (d.depth == 0) {
                            d.y = 0
                        }
                        if (d.depth == 1) {
                            d.y = 120
                        }
                        if (d.depth == 2) {
                            d.y = 200
                        }
                    });
    
                    // Update the nodes…
                    var node = svg.selectAll("g.node")
                        .data(nodes, function (d) { return d.id || (d.id = ++i); })
                    //.attr("transform", function(d, i) { return "translate("+i * 5 + "," + i * 20 + ")"; });
    
                    // Enter any new nodes at the parent's previous position.
                    var nodeEnter = node.enter().append("g")
                        .attr("class", "node")
                        .on("click", click);
    
                    nodeEnter.append("circle")
                        .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });
    
                    nodeEnter.append("text")
                        .attr("x", 10)
                        .attr("dy", function (d) {
                            if (d.depth == 1) {
                                return '1.2em'
                            }
                            if (d.depth == 2) {
                                return '0em'
                            }
                        })
                        .attr("text-anchor", function (d) {
                            if (d.depth == 0) {
                                return 'start'
                            }                            
                            if (d.depth == 1) {
                                return 'middle'
                            }
                            if (d.depth == 2) {
                                return 'start'
                            }
                        })
                        .text(function (d) {
                            var rows = splitText(d.name)
                            return rows.r1;
                        });
    
                    nodeEnter.append("text")
                        .attr("x", 10)
                        .attr("dy", function (d) {
                            if (d.depth == 0) {
                                return '1em'
                            }
                            if (d.depth == 1) {
                                return '2.2em'
                            }
                            if (d.depth == 2) {
                                return '1em'
                            }
                        })
                        .attr("text-anchor", function (d) {
                            if (d.depth == 0) {
                                return 'start'
                            }                               
                            if (d.depth == 1) {
                                return 'middle'
                            }
                            if (d.depth == 2) {
                                return 'start'
                            }
                        })
                        .text(function (d) {
                            var rows = splitText(d.name)
                            return rows.r2;
                        });
    
    
    
                    // Transition nodes to their new position.
                    var nodeUpdate = node.transition()
                        .duration(duration)
                        .attr("transform", function (d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
    
                    nodeUpdate.select("circle")
                        .attr("r", 5)
                        .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });
    
                    nodeUpdate.selectAll("text")
                        .style("fill-opacity", 1)
                        .attr("transform", function (d) {
                            if (d.depth == 0) {
                                return 'rotate(0)'
                            }
                            if (d.depth == 1) {
                                // var rows = splitText(d.name)
                                // var max_len = rows.r1.length > rows.r2.length ? rows.r1.length : rows.r2.length                                
                                // var half_name_text_len = d.name.length * 3
                                return 'rotate(90)'
                            }
                            if (d.depth == 2){
                                return 'rotate(0)'
                            }
                            // console.log(d)
                            // return 'rotate(180)'
                            // return d.x < 180 ? "translate(0)" : "rotate(180)translate(-" + ((d.MovieID + '').length + 50) + ")";
                        });
    
                    // TODO: appropriate transform
                    var nodeExit = node.exit().transition()
                        .duration(duration)
                        .attr("transform", function (d) { return "diagonal(" + (source.y) + "," + (source.x) + ")"; })
                        .remove();
    
                    nodeExit.select("circle")
                        .attr("r", 1);
    
                    nodeExit.selectAll("text")
                        .duration(duration)
                        .style("fill-opacity", 0);
    
                    // Update the links…
                    var link = svg.selectAll("path.link")
                        .data(links, function (d) {
                            return d.target.id;
                        });
    
                    // Enter any new links at the parent's previous position.
                    link.enter().insert("path", "g")
                        .attr("class", "link")
                        .attr("d", function (d) {
                            var o = { x: source.x0, y: source.y0 };
                            return diagonal({ source: o, target: o });
                        });
    
                    // Transition links to their new position.
                    link.transition()
                        .duration(duration)
                        .attr("d", diagonal);
    
                    // Transition exiting nodes to the parent's new position.
                    link.exit().transition()
                        .duration(duration)
                        .attr("d", function (d) {
                            var o = { x: source.x, y: source.y };
                            return diagonal({ source: o, target: o });
                        })
                        .remove();
    
                    // Stash the old positions for transition.
                    nodes.forEach(function (d) {
                        d.x0 = d.x;
                        d.y0 = d.y;
                    });
                }
    
                // Toggle children on click.
                function click(d) {
                    if (d.children) {
                        d.children.forEach(collapse)
                        d._children = d.children;
                        d.children = null;
                    } else {
                        d.children = d._children;
                        d._children = null;
                        window.setTimeout(function () {
                            d.children.forEach(click)
                        }, 1000)
                    }
    
                    update(d);
                }
    
                // Collapse nodes
                function collapse(d) {
                    if (d.children) {
                        d.children
                        d._children = d.children;
                        d.children = null;
                        return d._children.forEach(collapse);
                    } else {
                        return false
                    }
                }
    
            }
    
    
    
        })
    })    
    function scale(index) {
        // var r = window.innerWidth / (diameter * 5)
        // $('#tree-' + index + ' svg').css({
        //     transform: 'scale(' + r + ')'
        // })
    }    
    
})




