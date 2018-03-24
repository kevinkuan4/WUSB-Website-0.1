const keystone = require('keystone'),
	_ = require('underscore'),
	env = keystone.get('env'),
	User = keystone.list('User'),
	Program = keystone.list('Program');

if (env === 'development') {
	const programs = [
		{
			title: 'JSO Radio',
			genre: 'J-Pop',
			description: 'Audio treasures from Japan',
			day: '0',
			startTime: '1200',
			endTime: '1400'
		},
		{
			title: 'Fever Dream',
			genre: 'Dream pop',
			description: 'Dream pop and shoegaze',
			isBiweekly: true,
			biweeklyState: true,
			day: '1',
			startTime: '1200',
			endTime: '1400'
		},
		{
			title: "Ken's Playhouse",
			genre: 'Experimental',
			description: 'LOL',
			day: '1',
			startTime: '1630',
			endTime: '1830'
		}
	];

	exports = module.exports = done => {
		User.model.findOne((err, user) => {
			if (err) {
				console.error(err);
				done(err);
			}
			else {
				_.each(programs, p => {
					const program = new Program.model(p);
					program.djs = [user.id];
					program.save(err => {
						if (err) {
							console.error(err);
						}
					});
				});
				done(err);
			}
		});
	};
} else {
	exports = module.exports = done => {
		console.log('Patch 0.0.3 is not applicable in production or ' +
			'testing.');
		done();
	}
}
