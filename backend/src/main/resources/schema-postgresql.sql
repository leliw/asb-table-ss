create table users (
    username varchar(50) not null primary key,
    password varchar(500) not null,
    enabled boolean not null
);

create table authorities (
    username varchar(50) not null,
    authority varchar(50) not null,
    constraint fk_authorities_users foreign key(username) references users(username)
);
create unique index ix_auth_username on authorities (username,authority);

create table oscars (
	id serial primary key,
	title varchar(255),
	oscar_year varchar(7),
	studio varchar(100),
	award varchar(7),
	year_of_release integer,
	movie_time integer,
	genre varchar(255)
);
create unique index ix_oscars_title_year on oscars (title, year_of_release);