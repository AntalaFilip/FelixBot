import React from 'react';
import {
	BrowserRouter as Router, Route, Switch
} from 'react-router-dom';

import LessonList from './lessonlist';
import ShowLesson from './showlesson';

function Lessons() {
	return(
		<Router basename="/app/lessons">
			<Switch>
				<Route exact path="/">
					<LessonList />
				</Route>
				<Route path="/:id" children={<ShowLesson />} />
			</Switch>
		</Router>
	)
}

export default Lessons;