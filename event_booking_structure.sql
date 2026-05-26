--
-- PostgreSQL database dump
--

\restrict NVtvxPi4LchiZ3nCpuZwFfni0ysmV6njxnB0iR1LX8x3YB05iZ8JHZ744V7jOAb

-- Dumped from database version 17.10 (Debian 17.10-1.pgdg13+1)
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-26 15:27:36

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 16391)
-- Name: artists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.artists (
    artist_id integer NOT NULL,
    artist_name character varying(255) NOT NULL
);


ALTER TABLE public.artists OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16390)
-- Name: artists_artist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.artists_artist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.artists_artist_id_seq OWNER TO postgres;

--
-- TOC entry 3538 (class 0 OID 0)
-- Dependencies: 217
-- Name: artists_artist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.artists_artist_id_seq OWNED BY public.artists.artist_id;


--
-- TOC entry 226 (class 1259 OID 16439)
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    booking_id integer NOT NULL,
    schedule_id integer NOT NULL,
    customer_name character varying(255) NOT NULL,
    phone character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    payment_account text,
    payment_status character varying(50),
    created_at timestamp without time zone
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16438)
-- Name: bookings_booking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bookings_booking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_booking_id_seq OWNER TO postgres;

--
-- TOC entry 3539 (class 0 OID 0)
-- Dependencies: 225
-- Name: bookings_booking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bookings_booking_id_seq OWNED BY public.bookings.booking_id;


--
-- TOC entry 232 (class 1259 OID 16483)
-- Name: e_tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.e_tickets (
    ticket_id integer NOT NULL,
    ticket_config_id integer NOT NULL,
    event_day_id integer NOT NULL,
    booking_id integer,
    ticket_code character varying(255),
    ticket_status character varying(50) NOT NULL,
    row_label character varying(50),
    col_number integer
);


ALTER TABLE public.e_tickets OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16482)
-- Name: e_tickets_ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.e_tickets_ticket_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.e_tickets_ticket_id_seq OWNER TO postgres;

--
-- TOC entry 3540 (class 0 OID 0)
-- Dependencies: 231
-- Name: e_tickets_ticket_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.e_tickets_ticket_id_seq OWNED BY public.e_tickets.ticket_id;


--
-- TOC entry 234 (class 1259 OID 16509)
-- Name: event_artists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_artists (
    event_artist_id integer NOT NULL,
    event_day_id integer NOT NULL,
    artist_id integer NOT NULL,
    is_backup boolean NOT NULL
);


ALTER TABLE public.event_artists OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16508)
-- Name: event_artists_event_artist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.event_artists_event_artist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.event_artists_event_artist_id_seq OWNER TO postgres;

--
-- TOC entry 3541 (class 0 OID 0)
-- Dependencies: 233
-- Name: event_artists_event_artist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.event_artists_event_artist_id_seq OWNED BY public.event_artists.event_artist_id;


--
-- TOC entry 228 (class 1259 OID 16455)
-- Name: event_days; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_days (
    event_day_id integer NOT NULL,
    event_schedule_id integer NOT NULL,
    date timestamp without time zone NOT NULL
);


ALTER TABLE public.event_days OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16454)
-- Name: event_days_event_day_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.event_days_event_day_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.event_days_event_day_id_seq OWNER TO postgres;

--
-- TOC entry 3542 (class 0 OID 0)
-- Dependencies: 227
-- Name: event_days_event_day_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.event_days_event_day_id_seq OWNED BY public.event_days.event_day_id;


--
-- TOC entry 224 (class 1259 OID 16417)
-- Name: event_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_schedules (
    schedule_id integer NOT NULL,
    event_id integer NOT NULL,
    venue_id integer NOT NULL,
    registration_start timestamp without time zone,
    registration_end timestamp without time zone,
    seat_layout text
);


ALTER TABLE public.event_schedules OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16416)
-- Name: event_schedules_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.event_schedules_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.event_schedules_schedule_id_seq OWNER TO postgres;

--
-- TOC entry 3543 (class 0 OID 0)
-- Dependencies: 223
-- Name: event_schedules_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.event_schedules_schedule_id_seq OWNED BY public.event_schedules.schedule_id;


--
-- TOC entry 220 (class 1259 OID 16399)
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    event_id integer NOT NULL,
    event_name character varying(255) NOT NULL,
    description text,
    number_of_days integer,
    status character varying(50) NOT NULL,
    banner_url text
);


ALTER TABLE public.events OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16398)
-- Name: events_event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.events_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_event_id_seq OWNER TO postgres;

--
-- TOC entry 3544 (class 0 OID 0)
-- Dependencies: 219
-- Name: events_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.events_event_id_seq OWNED BY public.events.event_id;


--
-- TOC entry 230 (class 1259 OID 16469)
-- Name: ticket_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_configs (
    config_id integer NOT NULL,
    schedule_id integer NOT NULL,
    ticket_type character varying(100) NOT NULL,
    price numeric(12,2) NOT NULL,
    max_quantity integer NOT NULL
);


ALTER TABLE public.ticket_configs OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16468)
-- Name: ticket_configs_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ticket_configs_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_configs_config_id_seq OWNER TO postgres;

--
-- TOC entry 3545 (class 0 OID 0)
-- Dependencies: 229
-- Name: ticket_configs_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ticket_configs_config_id_seq OWNED BY public.ticket_configs.config_id;


--
-- TOC entry 222 (class 1259 OID 16409)
-- Name: venues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.venues (
    venue_id integer NOT NULL,
    venue_name character varying(255) NOT NULL,
    capacity integer NOT NULL,
    city character varying(100) NOT NULL
);


ALTER TABLE public.venues OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16408)
-- Name: venues_venue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.venues_venue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.venues_venue_id_seq OWNER TO postgres;

--
-- TOC entry 3546 (class 0 OID 0)
-- Dependencies: 221
-- Name: venues_venue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.venues_venue_id_seq OWNED BY public.venues.venue_id;


--
-- TOC entry 3314 (class 2604 OID 16394)
-- Name: artists artist_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.artists ALTER COLUMN artist_id SET DEFAULT nextval('public.artists_artist_id_seq'::regclass);


--
-- TOC entry 3318 (class 2604 OID 16442)
-- Name: bookings booking_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings ALTER COLUMN booking_id SET DEFAULT nextval('public.bookings_booking_id_seq'::regclass);


--
-- TOC entry 3321 (class 2604 OID 16486)
-- Name: e_tickets ticket_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.e_tickets ALTER COLUMN ticket_id SET DEFAULT nextval('public.e_tickets_ticket_id_seq'::regclass);


--
-- TOC entry 3322 (class 2604 OID 16512)
-- Name: event_artists event_artist_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_artists ALTER COLUMN event_artist_id SET DEFAULT nextval('public.event_artists_event_artist_id_seq'::regclass);


--
-- TOC entry 3319 (class 2604 OID 16458)
-- Name: event_days event_day_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_days ALTER COLUMN event_day_id SET DEFAULT nextval('public.event_days_event_day_id_seq'::regclass);


--
-- TOC entry 3317 (class 2604 OID 16420)
-- Name: event_schedules schedule_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_schedules ALTER COLUMN schedule_id SET DEFAULT nextval('public.event_schedules_schedule_id_seq'::regclass);


--
-- TOC entry 3315 (class 2604 OID 16402)
-- Name: events event_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events ALTER COLUMN event_id SET DEFAULT nextval('public.events_event_id_seq'::regclass);


--
-- TOC entry 3320 (class 2604 OID 16472)
-- Name: ticket_configs config_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_configs ALTER COLUMN config_id SET DEFAULT nextval('public.ticket_configs_config_id_seq'::regclass);


--
-- TOC entry 3316 (class 2604 OID 16412)
-- Name: venues venue_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venues ALTER COLUMN venue_id SET DEFAULT nextval('public.venues_venue_id_seq'::regclass);


--
-- TOC entry 3516 (class 0 OID 16391)
-- Dependencies: 218
-- Data for Name: artists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.artists (artist_id, artist_name) FROM stdin;
1	NộmKimchi
2	Tá senu
\.


--
-- TOC entry 3524 (class 0 OID 16439)
-- Dependencies: 226
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (booking_id, schedule_id, customer_name, phone, email, payment_account, payment_status, created_at) FROM stdin;
1	3	Khach Hang 1	0999999999	Khach Hang 1@gmail.com	\N	Pending	\N
\.


--
-- TOC entry 3530 (class 0 OID 16483)
-- Dependencies: 232
-- Data for Name: e_tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.e_tickets (ticket_id, ticket_config_id, event_day_id, booking_id, ticket_code, ticket_status, row_label, col_number) FROM stdin;
1	2	1	1	\N	Holding	A	1
\.


--
-- TOC entry 3532 (class 0 OID 16509)
-- Dependencies: 234
-- Data for Name: event_artists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_artists (event_artist_id, event_day_id, artist_id, is_backup) FROM stdin;
\.


--
-- TOC entry 3526 (class 0 OID 16455)
-- Dependencies: 228
-- Data for Name: event_days; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_days (event_day_id, event_schedule_id, date) FROM stdin;
1	3	2026-05-26 15:09:40.123562
\.


--
-- TOC entry 3522 (class 0 OID 16417)
-- Dependencies: 224
-- Data for Name: event_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_schedules (schedule_id, event_id, venue_id, registration_start, registration_end, seat_layout) FROM stdin;
1	2	2	\N	\N	\N
2	3	3	\N	\N	\N
3	4	4	\N	\N	\N
\.


--
-- TOC entry 3518 (class 0 OID 16399)
-- Dependencies: 220
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (event_id, event_name, description, number_of_days, status, banner_url) FROM stdin;
1	ĐộkikiFestival	Sự kiện của người Tày	2	ACTIVE	
2	Concert BlackPink	\N	\N	Published	\N
3	Concert BlackPink	\N	\N	Published	\N
4	Concert BlackPink	\N	\N	Published	\N
\.


--
-- TOC entry 3528 (class 0 OID 16469)
-- Dependencies: 230
-- Data for Name: ticket_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ticket_configs (config_id, schedule_id, ticket_type, price, max_quantity) FROM stdin;
1	2	VIP	5000000.00	1
2	3	VIP	5000000.00	1
\.


--
-- TOC entry 3520 (class 0 OID 16409)
-- Dependencies: 222
-- Data for Name: venues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.venues (venue_id, venue_name, capacity, city) FROM stdin;
1	Cao Bằng arena	100	Cao Bằng
2	San Van Dong My Dinh	40000	Ha Noi
3	San Van Dong My Dinh	40000	Ha Noi
4	San Van Dong My Dinh	40000	Ha Noi
\.


--
-- TOC entry 3547 (class 0 OID 0)
-- Dependencies: 217
-- Name: artists_artist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.artists_artist_id_seq', 2, true);


--
-- TOC entry 3548 (class 0 OID 0)
-- Dependencies: 225
-- Name: bookings_booking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bookings_booking_id_seq', 3, true);


--
-- TOC entry 3549 (class 0 OID 0)
-- Dependencies: 231
-- Name: e_tickets_ticket_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.e_tickets_ticket_id_seq', 1, true);


--
-- TOC entry 3550 (class 0 OID 0)
-- Dependencies: 233
-- Name: event_artists_event_artist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.event_artists_event_artist_id_seq', 1, false);


--
-- TOC entry 3551 (class 0 OID 0)
-- Dependencies: 227
-- Name: event_days_event_day_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.event_days_event_day_id_seq', 1, true);


--
-- TOC entry 3552 (class 0 OID 0)
-- Dependencies: 223
-- Name: event_schedules_schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.event_schedules_schedule_id_seq', 3, true);


--
-- TOC entry 3553 (class 0 OID 0)
-- Dependencies: 219
-- Name: events_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_event_id_seq', 4, true);


--
-- TOC entry 3554 (class 0 OID 0)
-- Dependencies: 229
-- Name: ticket_configs_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ticket_configs_config_id_seq', 2, true);


--
-- TOC entry 3555 (class 0 OID 0)
-- Dependencies: 221
-- Name: venues_venue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.venues_venue_id_seq', 4, true);


--
-- TOC entry 3324 (class 2606 OID 16396)
-- Name: artists artists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.artists
    ADD CONSTRAINT artists_pkey PRIMARY KEY (artist_id);


--
-- TOC entry 3338 (class 2606 OID 16446)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (booking_id);


--
-- TOC entry 3350 (class 2606 OID 16488)
-- Name: e_tickets e_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.e_tickets
    ADD CONSTRAINT e_tickets_pkey PRIMARY KEY (ticket_id);


--
-- TOC entry 3356 (class 2606 OID 16514)
-- Name: event_artists event_artists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_artists
    ADD CONSTRAINT event_artists_pkey PRIMARY KEY (event_artist_id);


--
-- TOC entry 3342 (class 2606 OID 16460)
-- Name: event_days event_days_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_days
    ADD CONSTRAINT event_days_pkey PRIMARY KEY (event_day_id);


--
-- TOC entry 3333 (class 2606 OID 16424)
-- Name: event_schedules event_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_schedules
    ADD CONSTRAINT event_schedules_pkey PRIMARY KEY (schedule_id);


--
-- TOC entry 3327 (class 2606 OID 16406)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (event_id);


--
-- TOC entry 3348 (class 2606 OID 16474)
-- Name: ticket_configs ticket_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_configs
    ADD CONSTRAINT ticket_configs_pkey PRIMARY KEY (config_id);


--
-- TOC entry 3331 (class 2606 OID 16414)
-- Name: venues venues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venues
    ADD CONSTRAINT venues_pkey PRIMARY KEY (venue_id);


--
-- TOC entry 3325 (class 1259 OID 16397)
-- Name: ix_artists_artist_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_artists_artist_id ON public.artists USING btree (artist_id);


--
-- TOC entry 3339 (class 1259 OID 16453)
-- Name: ix_bookings_booking_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_bookings_booking_id ON public.bookings USING btree (booking_id);


--
-- TOC entry 3340 (class 1259 OID 16452)
-- Name: ix_bookings_schedule_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_bookings_schedule_id ON public.bookings USING btree (schedule_id);


--
-- TOC entry 3351 (class 1259 OID 16504)
-- Name: ix_e_tickets_booking_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_e_tickets_booking_id ON public.e_tickets USING btree (booking_id);


--
-- TOC entry 3352 (class 1259 OID 16507)
-- Name: ix_e_tickets_event_day_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_e_tickets_event_day_id ON public.e_tickets USING btree (event_day_id);


--
-- TOC entry 3353 (class 1259 OID 16505)
-- Name: ix_e_tickets_ticket_config_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_e_tickets_ticket_config_id ON public.e_tickets USING btree (ticket_config_id);


--
-- TOC entry 3354 (class 1259 OID 16506)
-- Name: ix_e_tickets_ticket_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_e_tickets_ticket_id ON public.e_tickets USING btree (ticket_id);


--
-- TOC entry 3357 (class 1259 OID 16526)
-- Name: ix_event_artists_artist_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_event_artists_artist_id ON public.event_artists USING btree (artist_id);


--
-- TOC entry 3358 (class 1259 OID 16527)
-- Name: ix_event_artists_event_artist_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_event_artists_event_artist_id ON public.event_artists USING btree (event_artist_id);


--
-- TOC entry 3359 (class 1259 OID 16525)
-- Name: ix_event_artists_event_day_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_event_artists_event_day_id ON public.event_artists USING btree (event_day_id);


--
-- TOC entry 3343 (class 1259 OID 16467)
-- Name: ix_event_days_event_day_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_event_days_event_day_id ON public.event_days USING btree (event_day_id);


--
-- TOC entry 3344 (class 1259 OID 16466)
-- Name: ix_event_days_event_schedule_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_event_days_event_schedule_id ON public.event_days USING btree (event_schedule_id);


--
-- TOC entry 3334 (class 1259 OID 16435)
-- Name: ix_event_schedules_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_event_schedules_event_id ON public.event_schedules USING btree (event_id);


--
-- TOC entry 3335 (class 1259 OID 16437)
-- Name: ix_event_schedules_schedule_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_event_schedules_schedule_id ON public.event_schedules USING btree (schedule_id);


--
-- TOC entry 3336 (class 1259 OID 16436)
-- Name: ix_event_schedules_venue_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_event_schedules_venue_id ON public.event_schedules USING btree (venue_id);


--
-- TOC entry 3328 (class 1259 OID 16407)
-- Name: ix_events_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_events_event_id ON public.events USING btree (event_id);


--
-- TOC entry 3345 (class 1259 OID 16480)
-- Name: ix_ticket_configs_config_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ticket_configs_config_id ON public.ticket_configs USING btree (config_id);


--
-- TOC entry 3346 (class 1259 OID 16481)
-- Name: ix_ticket_configs_schedule_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ticket_configs_schedule_id ON public.ticket_configs USING btree (schedule_id);


--
-- TOC entry 3329 (class 1259 OID 16415)
-- Name: ix_venues_venue_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_venues_venue_id ON public.venues USING btree (venue_id);


--
-- TOC entry 3362 (class 2606 OID 16447)
-- Name: bookings bookings_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.event_schedules(schedule_id);


--
-- TOC entry 3365 (class 2606 OID 16499)
-- Name: e_tickets e_tickets_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.e_tickets
    ADD CONSTRAINT e_tickets_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id) ON DELETE SET NULL;


--
-- TOC entry 3366 (class 2606 OID 16494)
-- Name: e_tickets e_tickets_event_day_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.e_tickets
    ADD CONSTRAINT e_tickets_event_day_id_fkey FOREIGN KEY (event_day_id) REFERENCES public.event_days(event_day_id) ON DELETE CASCADE;


--
-- TOC entry 3367 (class 2606 OID 16489)
-- Name: e_tickets e_tickets_ticket_config_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.e_tickets
    ADD CONSTRAINT e_tickets_ticket_config_id_fkey FOREIGN KEY (ticket_config_id) REFERENCES public.ticket_configs(config_id) ON DELETE CASCADE;


--
-- TOC entry 3368 (class 2606 OID 16520)
-- Name: event_artists event_artists_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_artists
    ADD CONSTRAINT event_artists_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(artist_id) ON DELETE CASCADE;


--
-- TOC entry 3369 (class 2606 OID 16515)
-- Name: event_artists event_artists_event_day_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_artists
    ADD CONSTRAINT event_artists_event_day_id_fkey FOREIGN KEY (event_day_id) REFERENCES public.event_days(event_day_id) ON DELETE CASCADE;


--
-- TOC entry 3363 (class 2606 OID 16461)
-- Name: event_days event_days_event_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_days
    ADD CONSTRAINT event_days_event_schedule_id_fkey FOREIGN KEY (event_schedule_id) REFERENCES public.event_schedules(schedule_id) ON DELETE CASCADE;


--
-- TOC entry 3360 (class 2606 OID 16425)
-- Name: event_schedules event_schedules_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_schedules
    ADD CONSTRAINT event_schedules_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE;


--
-- TOC entry 3361 (class 2606 OID 16430)
-- Name: event_schedules event_schedules_venue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_schedules
    ADD CONSTRAINT event_schedules_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(venue_id);


--
-- TOC entry 3364 (class 2606 OID 16475)
-- Name: ticket_configs ticket_configs_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_configs
    ADD CONSTRAINT ticket_configs_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.event_schedules(schedule_id) ON DELETE CASCADE;


-- Completed on 2026-05-26 15:27:37

--
-- PostgreSQL database dump complete
--

\unrestrict NVtvxPi4LchiZ3nCpuZwFfni0ysmV6njxnB0iR1LX8x3YB05iZ8JHZ744V7jOAb

